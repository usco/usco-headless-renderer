import test from 'ava'
import path from 'path'
import fs from 'fs'
import Jimp from 'jimp'

function existsSync (uri) {
  try {
    fs.statSync(uri)
    return true
  }catch (error) {
    return false
  }
}

function rmSync (uri) {
  try {
    fs.unlinkSync(uri)
  }catch (error) {
  }
}

test('server side renderer: can take a path to a file as input, generate a render of that 3d file as ouput(stl)', t => {
  // FIXME: can only be run locally (webgl support needed), commented out for now for travisCI
  // see https://github.com/stackgl/headless-gl/blob/master/.travis.yml

  let jamPath = './rendererCLI.js'
  let inputPath = './testData/cube.stl'
  let outputPath = './test.png'
  let resolution = '160x120'

  let expImagePath = './testData/exp.cube.stl.png'

  jamPath = path.resolve(__dirname, jamPath)
  inputPath = path.resolve(__dirname, inputPath)
  outputPath = path.resolve(__dirname, outputPath)
  outputPath = path.resolve(outputPath)
  expImagePath = path.resolve(__dirname, expImagePath)

  const cmd = `babel-node ${jamPath} ${inputPath} ${resolution} ${outputPath} `
  require('child_process').execSync(cmd, {stdio: [0, 1, 2]})
  // t.deepEqual(meshSource[0], 'fakeModel.stl')
  t.deepEqual(true, existsSync(outputPath))

  return Promise.all([Jimp.read(expImagePath), Jimp.read(outputPath)])
    .then(function (values) {
      let [exp, obs] = values
      let diff = Jimp.diff(exp, obs)
      let dist = Jimp.distance(exp, obs)
      const identical = (dist < 0.15 && diff.percent < 0.15)
      t.deepEqual(true, identical)
      rmSync(outputPath)
    }).catch(function () {
      rmSync(outputPath)
      t.fail('Files are not identical', expImagePath, outputPath)
    })
})

test('server side renderer: can take a path to a file as input, generate a render of that 3d file as ouput(3mf)', t => {
  let jamPath = './rendererCLI.js'
  let inputPath = './testData/cube_gears.3mf'// cube_gears.3mf'// dodeca_chain_loop_color.3mf'// pyramid_vertexcolor.3mf'
  let outputPath = './test.png'
  let resolution = '160x120'

  let expImagePath = './testData/exp.cube_gears.3mf.png'

  jamPath = path.resolve(__dirname, jamPath)
  inputPath = path.resolve(__dirname, inputPath)
  outputPath = path.resolve(__dirname, outputPath)
  outputPath = path.resolve(outputPath)
  expImagePath = path.resolve(__dirname, expImagePath)

  const cmd = `babel-node ${jamPath} ${inputPath} ${resolution} ${outputPath} `
  require('child_process').execSync(cmd, {stdio: [0, 1, 2]})
  t.deepEqual(true, existsSync(outputPath))

  return Promise.all([Jimp.read(expImagePath), Jimp.read(outputPath)])
    .then(function (values) {
      let [exp, obs] = values
      let diff = Jimp.diff(exp, obs)
      let dist = Jimp.distance(exp, obs)
      const identical = (dist < 0.15 && diff.percent < 0.15)
      t.deepEqual(true, identical)
      rmSync(outputPath)
    }).catch(function () {
      rmSync(outputPath)
      t.fail('Files are not identical', expImagePath, outputPath)
    })
})

test('server side renderer: can take a path to a file as input, generate a render of that 3d file as ouput(obj)', function () {
  let jamPath = './rendererCLI.js'
  let inputPath = './testData/cube.obj'
  let outputPath = './test.png'
  let resolution = '160x120'

  let expImagePath = './testData/exp.cube.obj.png'

  jamPath = path.resolve(__dirname, jamPath)
  inputPath = path.resolve(__dirname, inputPath)
  outputPath = path.resolve(__dirname, outputPath)
  outputPath = path.resolve(outputPath)
  expImagePath = path.resolve(__dirname, expImagePath)

  const cmd = `babel-node ${jamPath} ${inputPath} ${resolution} ${outputPath} `
  require('child_process').execSync(cmd, {stdio: [0, 1, 2]})

  t.deepEqual(true, existsSync(outputPath))

  return Promise.all([Jimp.read(expImagePath), Jimp.read(outputPath)])
    .then(function (values) {
      let [exp, obs] = values
      let diff = Jimp.diff(exp, obs)
      let dist = Jimp.distance(exp, obs)
      const identical = (dist < 0.15 && diff.percent < 0.15)
      t.deepEqual(true, identical)
      rmSync(outputPath)
    }).catch(function () {
      rmSync(outputPath)
      t.fail('Files are not identical', expImagePath, outputPath)
    })
})

test('server side renderer: can take a path to a file as input, generate a render of that 3d file as ouput(ctm)', function () {
  let jamPath = './rendererCLI.js'
  let inputPath = './testData/LeePerry.ctm'
  let outputPath = './test.png'
  let resolution = '160x120'

  let expImagePath = './testData/exp.LeePerry.ctm.png'

  jamPath = path.resolve(__dirname, jamPath)
  inputPath = path.resolve(__dirname, inputPath)
  outputPath = path.resolve(__dirname, outputPath)
  outputPath = path.resolve(outputPath)
  expImagePath = path.resolve(__dirname, expImagePath)

  const cmd = `babel-node ${jamPath} ${inputPath} ${resolution} ${outputPath} `
  require('child_process').execSync(cmd, {stdio: [0, 1, 2]})

  t.deepEqual(true, existsSync(outputPath))

  return Promise.all([Jimp.read(expImagePath), Jimp.read(outputPath)])
    .then(function (values) {
      let [exp, obs] = values
      let diff = Jimp.diff(exp, obs)
      let dist = Jimp.distance(exp, obs)
      const identical = (dist < 0.15 && diff.percent < 0.15)
      t.deepEqual(true, identical)
      rmSync(outputPath)
    }).catch(function () {
      rmSync(outputPath)
      t.fail('Files are not identical', expImagePath, outputPath)
    })
})
