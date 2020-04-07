import fs from 'fs'
import most from 'most'

import ctmParser from 'usco-ctm-parser'
import objParser from 'usco-obj-parser'

import makeStlStream from 'usco-stl-parser'
import make3mfStream from 'usco-3mf-parser'

import prepareRender from './render.js'
import imageUtils from 'usco-image-utils'
// import { writeContextToFile } from 'usco-image-utils'
// import { getNameAndExtension } from 'usco-file-utils'
import fileUtils from 'usco-file-utils'

import create from '@most/create'
import entityPrep from './utils/entityPrep.js'

import { camera as camerabase } from './utils/camera.js'
// import { computeCameraToFitBounds, cameraOffsetToEntityBoundsCenter } from 'usco-camera-utils'
import cameraUtils from 'usco-camera-utils'

import * as orbitControls from 'usco-orbit-controls'
import mat4 from 'gl-mat4'

import { getArgs } from './utils/args.js'
import * as makeRegl from 'regl'
import * as makeGl from 'gl'

// const version = require('../package.json').version
// FIXME
const version = '0.0.1'
// JSON.parse(fs.readFileSync('../package.json')).version

console.log('makeStlStream', makeStlStream)

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

// deal with command line args etc
let inputParams = getArgs()

const defaults = {
  resolution: '640x480',
  cameraPosition: `[${camerabase.position.join(',')}]`,
  input: undefined,
  output: 'output.png',
  verbose: false
}
let params = Object.assign({}, defaults, inputParams)

const { resolution, input, verbose } = params
const outputPath = params.output
const [width, height] = resolution.split('x').map(e => parseInt(e, 10))
const cameraPosition = params.cameraPosition.replace('[', '').replace(']', '').replace(/' '/g, '').split(',').map(e => parseFloat(e, 10))
const { ext } = fileUtils.getNameAndExtension(input)

if (Object.keys(inputParams).length === 0) {
  console.log(`usco-headless-renderer v${version}
    Missing parameters:
    use it like this : usco-headless-renderer input=<PATH-TO-FILE> output=<PATH-TO-OUTPUT.png> resolution=320x240 cameraPosition=[75, 75, 145] verbose=true
    `)
  process.exit(1)
}

if (verbose) {
  console.log(`Running renderer with params:
    input:${input}, output:${outputPath}, resolution:${width}x${height}, cameraPosition:${cameraPosition}`)
}

const parseOptions = { concat: true }
const parsers = {
  'stl': makeStlStream.default(parseOptions),
  '3mf': make3mfStream.default(parseOptions),
  'ctm': ctmParser,
  'obj': objParser
}

// create webgl context
const gl = makeGl.default(width, height)
// setup regl
const regl = makeRegl.default({
  gl
// extensions:['oes_element_index_uint']
}, (width, height))
// setup render function
const render = prepareRender(regl)

const parsedData$ = create((add, end, error) => {
  const parser = parsers[ext]
  if (!parser) {
    error(new Error(`no parser found for ${ext} format`))
  }
  if (ext === 'stl' || ext === '3mf') {
    fs.createReadStream(input)
      .pipe(parsers[ext]) // we get a stream back
      .on('data', function (parsedData) {
        add(parsedData)
      })
  } else {
    let data = fs.readFileSync(input, 'binary')
    const parsedObs$ = parsers[ext](data, {})
    parsedObs$
      .forEach(parsed => add(parsed))
  }
})

entityPrep(parsedData$, regl)
  .flatMapError(error => {
    console.error(error)
    most.of(undefined)
  })
  .filter(x => x !== undefined)
  .map(x => [x]) // FIXME: temporary hack until data structures are stable
  .forEach(function (entities) {
    // console.log(entities)
    const { bounds, transforms } = entities[0]
    let controlParams = orbitControls.params
    controlParams.limits.minDistance = 0
    camerabase.near = 0.01
    camerabase.position = cameraPosition

    let camera = setProjection(camerabase, { width, height })
    camera = Object.assign({}, camera, cameraUtils.cameraOffsetToEntityBoundsCenter({ camera, bounds, transforms, axis: 2 }))
    camera = Object.assign({}, camera, cameraUtils.computeCameraToFitBounds({ camera, bounds, transforms }))
    camera = Object.assign({}, camera, orbitControls.update(controlParams, camera))

    render({ entities, camera, view: camera.view, background: [1, 1, 1, 1] })
    console.log('done rendering')
    imageUtils.writeContextToFile(gl, width, height, 4, outputPath)
  })

/*
  fs.createReadStream(input)
  .pipe(parsers[ext]) // we get a stream back
  .on('data', function (geometry) {
    console.log('done with parsing') // , parsedData)

    render({entities: [], camera: {projection: null}, view: null, background: [1, 1, 1, 1]})
    writeContextToFile(gl, 256, 256, 4, outputPath)
  }) */
