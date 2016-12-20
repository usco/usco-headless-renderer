import test from 'ava'
import path from 'path'
import fs from 'fs'
import Jimp from 'jimp'

function existsSync (uri) {
  try {
    fs.statSync(uri)
    return true
  } catch (error) {
    return false
  }
}

test.afterEach.always(t => {
  // this runs after each test and other test hooks, even if they failed
  // remove created file
  try {
    fs.unlinkSync(t.context.outputPath)
  } catch(err) {}
})

test.beforeEach(t => {
  let jamPath = '../dist/index.js'
  t.context = {
    jamPath: path.resolve(__dirname, jamPath),
    resolution: '160x120'
  }
})

// note : use this with the node xxx command to debug in chrome: --inspect --debug-brk

test('server side renderer: can take a path to a file as input, generate a render of that 3d file as ouput(stl)', t => {
  // FIXME: can only be run locally (webgl support needed), commented out for now for travisCI
  // see https://github.com/stackgl/headless-gl/blob/master/.travis.yml
  const jamPath = t.context.jamPath
  const inputPath = path.resolve(__dirname, './data/cube.stl')
  const outputPath = path.resolve(__dirname, './test.stl.png')
  const expImagePath = path.resolve(__dirname, './data/exp.cube.stl.png')
  t.context = Object.assign({}, t.context, {outputPath})

  const cmd = `node ${jamPath} ${inputPath} ${t.context.resolution} ${outputPath} `
  require('child_process').execSync(cmd, {stdio: [0, 1, 2]})
  // t.deepEqual(meshSource[0], 'fakeModel.stl')
  t.deepEqual(true, existsSync(outputPath))

  return Promise.all([Jimp.read(expImagePath), Jimp.read(outputPath)])
    .then(function (values) {
      const [exp, obs] = values
      const diff = Jimp.diff(exp, obs)
      const dist = Jimp.distance(exp, obs)
      const identical = (dist < 0.1 && diff.percent < 0.1)
      t.deepEqual(true, identical)
    }).catch(function () {
    t.fail('Files are not identical', expImagePath, outputPath)
  })
})

test('server side renderer: can take a path to a file as input, generate a render of that 3d file as ouput(3mf)', t => {
  const jamPath = t.context.jamPath
  const inputPath = path.resolve(__dirname, './data/cube_gears.3mf') // cube_gears.3mf'// dodeca_chain_loop_color.3mf'// pyramid_vertexcolor.3mf'
  const outputPath = path.resolve(__dirname, './test.3mf.png')
  const expImagePath = path.resolve(__dirname, './data/exp.cube_gears.3mf.png')
  t.context = Object.assign({}, t.context, {outputPath})

  const cmd = `node ${jamPath} ${inputPath} ${t.context.resolution} ${outputPath} `
  require('child_process').execSync(cmd, {stdio: [0, 1, 2]})
  t.deepEqual(true, existsSync(outputPath))

  return Promise.all([Jimp.read(expImagePath), Jimp.read(outputPath)])
    .then(function (values) {
      let [exp, obs] = values
      let diff = Jimp.diff(exp, obs)
      let dist = Jimp.distance(exp, obs)
      const identical = (dist < 0.1 && diff.percent < 0.1)
      t.deepEqual(true, identical)
    }).catch(function () {
    t.fail('Files are not identical', expImagePath, outputPath)
  })
})

test('server side renderer: can take a path to a file as input, generate a render of that 3d file as ouput(obj)', t => {
  const jamPath = t.context.jamPath
  const inputPath = path.resolve(__dirname, './data/cube.obj')
  const outputPath = path.resolve(__dirname, './test.obj.png')
  const expImagePath = path.resolve(__dirname, './data/exp.cube.obj.png')
  t.context = Object.assign({}, t.context, {outputPath})

  const cmd = `node ${jamPath} ${inputPath} ${t.context.resolution} ${outputPath} `
  require('child_process').execSync(cmd, {stdio: [0, 1, 2]})

  t.deepEqual(true, existsSync(outputPath))

  return Promise.all([Jimp.read(expImagePath), Jimp.read(outputPath)])
    .then(function (values) {
      let [exp, obs] = values
      let diff = Jimp.diff(exp, obs)
      let dist = Jimp.distance(exp, obs)
      const identical = (dist < 0.1 && diff.percent < 0.1)
      t.deepEqual(true, identical)
    }).catch(function () {
    t.fail('Files are not identical', expImagePath, outputPath)
  })
})

test('server side renderer: can take a path to a file as input, generate a render of that 3d file as ouput(ctm)', t => {
  const jamPath = t.context.jamPath
  const inputPath = path.resolve(__dirname, './data/LeePerry.ctm')
  const outputPath = path.resolve(__dirname, './test.ctm.png')
  const expImagePath = path.resolve(__dirname, './data/exp.LeePerry.ctm.png')
  t.context = Object.assign({}, t.context, {outputPath})

  const cmd = `node ${jamPath} ${inputPath} ${t.context.resolution} ${outputPath} `
  require('child_process').execSync(cmd, {stdio: [0, 1, 2]})

  t.deepEqual(true, existsSync(outputPath))

  return Promise.all([Jimp.read(expImagePath), Jimp.read(outputPath)])
    .then(function (values) {
      let [exp, obs] = values
      let diff = Jimp.diff(exp, obs)
      let dist = Jimp.distance(exp, obs)
      const identical = (dist < 0.1 && diff.percent < 0.1)
      t.deepEqual(true, identical)
    }).catch(function () {
    t.fail('Files are not identical', expImagePath, outputPath)
  })
})
