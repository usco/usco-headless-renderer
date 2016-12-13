import fs from 'fs'

import stlParser from 'usco-stl-parser'
/*import objParser from 'usco-obj-parser'
import ctmParser from 'usco-ctm-parser'
import threeMfParser from 'usco-3mf-parser'*/

import prepareRender from './render'
import { writeContextToFile } from 'usco-image-utils'
import { getNameAndExtension } from 'usco-file-utils'

import create from '@most/create'
import entityPrep from './utils/entityPrep'

import { camera as camerabase } from './utils/camera'
import { computeCameraToFitBounds } from 'usco-camera-utils'

import * as orbitControls from 'usco-orbit-controls'
import mat4 from 'gl-mat4'

console.log('orbitControls', orbitControls)

function setProjection (state, input) {
  const projection = mat4.perspective([], state.fov, input.width / input.height, // context.viewportWidth / context.viewportHeight,
    state.near,
    state.far)
  // state = Object.assign({}, state, {projection})
  state.projection = projection
  state.aspect = input.width / input.height
  // state = Object.assign({}, state, update(settings, state)) // not sure
  return state
}

// ///////deal with command line args etc
let args = process.argv.slice(2)

if (args.length > 0) {
  // more advanced params handling , for later
  /*
    console.log("params",args)
    let params = args.reduce(function(cur,combo){
    let [name,val]= cur.split("=")
    combo[name] = val
  },{})*/

  const uri = args[0]
  const [width, height] = args[1].split('x').map(e => parseInt(e, 10))
  const outputPath = args[2] ? args[2] : `${uri}.png`

  const {ext} = getNameAndExtension(uri)
  const resolution = {width, height}

  console.log('outputPath', outputPath, 'ext', ext)

  console.log('Running renderer with params', uri, resolution, outputPath)

  const parseOptions = {concat: true}
  const parsers = {
    'stl': stlParser(parseOptions),
  /*'obj': objParser,
  'ctm': ctmParser,
  '3mf': threeMfParser*/
  }

  // create webgl context
  const gl = require('gl')(width, height)
  // setup regl
  const regl = require('regl')(gl, (width, height))
  // setup render function
  const render = prepareRender(regl)

  const parsedData$ = create((add, end, error) => {
    fs.createReadStream(uri)
      .pipe(parsers[ext]) // we get a stream back
      .on('data', function (parsedData) {
        add(parsedData)
      })
  })
  entityPrep(parsedData$, regl)
    .forEach(function (entity) {
      let camera = setProjection(camerabase, {width, height})
      camera = Object.assign({}, camera, computeCameraToFitBounds({camera, bounds: entity.bounds, transforms: entity.transforms}))
      camera = Object.assign({}, camera, orbitControls.update(orbitControls.params, camera))
      render({entities: [entity], camera, view: camera.view, background: [1, 1, 1, 1]})
      writeContextToFile(gl, width, height, 4, outputPath)
    })

/*
fs.createReadStream(uri)
  .pipe(parsers[ext]) // we get a stream back
  .on('data', function (geometry) {
    console.log('done with parsing') // , parsedData)

    render({entities: [], camera: {projection: null}, view: null, background: [1, 1, 1, 1]})
    writeContextToFile(gl, 256, 256, 4, outputPath)
  })*/
}
