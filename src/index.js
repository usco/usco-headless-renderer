import fs from 'fs'
import { from } from 'most'

import ctmParser from 'usco-ctm-parser'
import objParser from 'usco-obj-parser'

import makeStlStream from 'usco-stl-parser'
// import make3mfStream from 'usco-3mf-parser'

import prepareRender from './render'
import { writeContextToFile } from 'usco-image-utils'
import { getNameAndExtension } from 'usco-file-utils'

import create from '@most/create'
import entityPrep from './utils/entityPrep'

import { camera as camerabase } from './utils/camera'
import { computeCameraToFitBounds, cameraOffsetToEntityBoundsCenter } from 'usco-camera-utils'

import * as orbitControls from 'usco-orbit-controls'
import mat4 from 'gl-mat4'

var version = require('../package.json').version

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
if (args.length === 0) {
  console.log(`usco-headless-renderer v${version}
    use it like this : usco-headless-renderer <PATH-TO-FILE> '320x240' <PATH-TO-OUTPUT.png>
    `)
}
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

  // console.log('outputPath', outputPath, 'ext', ext)
  console.log('Running renderer with params', uri, resolution, outputPath)

  const parseOptions = {concat: true}
  const parsers = {
    'stl': makeStlStream(parseOptions),
    'ctm': ctmParser,
    'obj': objParser,
  // '3mf': make3mfStream(parseOptions)
  }

  // create webgl context
  const gl = require('gl')(width, height)
  // setup regl
  const regl = require('regl')({
    gl,
  // extensions:['oes_element_index_uint']
  }, (width, height))
  // setup render function
  const render = prepareRender(regl)

  const parsedData$ = create((add, end, error) => {
    const parser = parsers[ext]
    if (!parser) {
      error(new Error(`no parser found for ${ext} format`))
    }
    if (ext === 'stl') {
      fs.createReadStream(uri)
        .pipe(parsers[ext]) // we get a stream back
        .on('data', function (parsedData) {
          add(parsedData)
        })
    } else {
      let data = fs.readFileSync(uri, 'binary')
      const parsedObs$ = parsers[ext](data, {})
      parsedObs$
        .forEach(add)
    }
  })

  entityPrep(parsedData$, regl)
    .forEach(function (entity) {
      const {bounds, transforms} = entity
      let controlParams = orbitControls.params
      controlParams.limits.minDistance = 0
      camerabase.near = 0.01

      let camera = setProjection(camerabase, {width, height})
      camera = Object.assign({}, camera, cameraOffsetToEntityBoundsCenter({camera, bounds, transforms, axis: 2}))
      camera = Object.assign({}, camera, computeCameraToFitBounds({camera, bounds, transforms}))
      camera = Object.assign({}, camera, orbitControls.update(controlParams, camera))

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
