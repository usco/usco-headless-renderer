import fs from 'fs'

import stlParser from 'usco-stl-parser'
/*import objParser from 'usco-obj-parser'
import ctmParser from 'usco-ctm-parser'
import threeMfParser from 'usco-3mf-parser'*/

import prepareRender from './render'
import { writeContextToFile } from './imgUtils'
import { getNameAndExtension } from './fileUtils'
// import {postProcessParsedData, toArrayBuffer} from './parseUtils'

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

  fs.createReadStream(uri)
    .pipe(parsers[ext]) // we get a stream back
    .on('data', function (parsedData) {
      console.log('done with parsing') // , parsedData)
      render({entities: [], camera: {projection:null}, view: null, background: [1, 1, 1, 1]})
      // view({mesh, uri: outputPath, resolution}) // each time some data is parsed, render it
      writeContextToFile(gl, 256, 256, 4, outputPath)
    })
}
