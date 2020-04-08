'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _most = require('most');

var _uscoCtmParser = require('usco-ctm-parser');

var _uscoCtmParser2 = _interopRequireDefault(_uscoCtmParser);

var _uscoObjParser = require('usco-obj-parser');

var _uscoObjParser2 = _interopRequireDefault(_uscoObjParser);

var _uscoStlParser = require('usco-stl-parser');

var _uscoStlParser2 = _interopRequireDefault(_uscoStlParser);

var _usco3mfParser = require('usco-3mf-parser');

var _usco3mfParser2 = _interopRequireDefault(_usco3mfParser);

var _render = require('./render');

var _render2 = _interopRequireDefault(_render);

var _imgUtils = require('usco-image-utils/dist/imgUtils');

var _uscoFileUtils = require('usco-file-utils');

var _create = require('@most/create');

var _create2 = _interopRequireDefault(_create);

var _entityPrep = require('./utils/entityPrep');

var _entityPrep2 = _interopRequireDefault(_entityPrep);

var _camera = require('./utils/camera');

var _uscoCameraUtils = require('usco-camera-utils');

var _uscoOrbitControls = require('usco-orbit-controls');

var orbitControls = _interopRequireWildcard(_uscoOrbitControls);

var _glMat = require('gl-mat4');

var _glMat2 = _interopRequireDefault(_glMat);

var _args = require('./utils/args');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var version = require('../package.json').version;

function setProjection(state, input) {
  var projection = _glMat2.default.perspective([], state.fov, input.width / input.height, // context.viewportWidth / context.viewportHeight,
  state.near, state.far);
  // state = Object.assign({}, state, {projection})
  state.projection = projection;
  state.aspect = input.width / input.height;
  // state = Object.assign({}, state, update(settings, state)) // not sure
  return state;
}

// deal with command line args etc
var inputParams = (0, _args.getArgs)();

var defaults = {
  resolution: '640x480',
  cameraPosition: '[' + _camera.camera.position.join(',') + ']',
  input: undefined,
  output: 'output.png',
  verbose: false
};
var params = Object.assign({}, defaults, inputParams);

var resolution = params.resolution,
    input = params.input,
    verbose = params.verbose;

var outputPath = params.output;

var _resolution$split$map = resolution.split('x').map(function (e) {
  return parseInt(e, 10);
}),
    _resolution$split$map2 = _slicedToArray(_resolution$split$map, 2),
    width = _resolution$split$map2[0],
    height = _resolution$split$map2[1];

var cameraPosition = params.cameraPosition.replace('[', '').replace(']', '').replace(/' '/g, '').split(',').map(function (e) {
  return parseFloat(e, 10);
});

var _getNameAndExtension = (0, _uscoFileUtils.getNameAndExtension)(input),
    ext = _getNameAndExtension.ext;

if (Object.keys(inputParams).length === 0) {
  console.log('usco-headless-renderer v' + version + '\n    Missing parameters:\n    use it like this : usco-headless-renderer input=<PATH-TO-FILE> output=<PATH-TO-OUTPUT.png> resolution=320x240 cameraPosition=[75, 75, 145] verbose=true\n    ');
  process.exit(1);
}

if (verbose) {
  console.log('Running renderer with params:\n    input:' + input + ', output:' + outputPath + ', resolution:' + width + 'x' + height + ', cameraPosition:' + cameraPosition);
}

var parseOptions = { concat: true };
var parsers = {
  'stl': (0, _uscoStlParser2.default)(parseOptions),
  '3mf': (0, _usco3mfParser2.default)(parseOptions),
  'ctm': _uscoCtmParser2.default,
  'obj': _uscoObjParser2.default
};

// create webgl context
var gl = require('gl')(width, height);
// setup regl
var regl = require('regl')({
  gl: gl
}, (width, height));
// setup render function
var render = (0, _render2.default)(regl);

var parsedData$ = (0, _create2.default)(function (add, end, error) {
  var parser = parsers[ext];
  if (!parser) {
    error(new Error('no parser found for ' + ext + ' format'));
  }
  if (ext === 'stl' || ext === '3mf') {
    _fs2.default.createReadStream(input).pipe(parsers[ext]) // we get a stream back
    .on('data', function (parsedData) {
      add(parsedData);
    });
  } else {
    var data = _fs2.default.readFileSync(input, 'binary');
    var parsedObs$ = parsers[ext](data, {});
    parsedObs$.forEach(function (parsed) {
      return add(parsed);
    });
  }
});

(0, _entityPrep2.default)(parsedData$, regl).flatMapError(function (error) {
  console.error(error);
  (0, _most.of)(undefined);
}).filter(function (x) {
  return x !== undefined;
}).map(function (x) {
  return [x];
}) // FIXME: temporary hack until data structures are stable
.forEach(function (entities) {
  // console.log(entities)
  var _entities$ = entities[0],
      bounds = _entities$.bounds,
      transforms = _entities$.transforms;

  var controlParams = orbitControls.params;
  controlParams.limits.minDistance = 0;
  _camera.camera.near = 0.01;
  _camera.camera.position = cameraPosition;

  var camera = setProjection(_camera.camera, { width: width, height: height });
  camera = Object.assign({}, camera, (0, _uscoCameraUtils.cameraOffsetToEntityBoundsCenter)({ camera: camera, bounds: bounds, transforms: transforms, axis: 2 }));
  camera = Object.assign({}, camera, (0, _uscoCameraUtils.computeCameraToFitBounds)({ camera: camera, bounds: bounds, transforms: transforms }));
  camera = Object.assign({}, camera, orbitControls.update(controlParams, camera));

  render({ entities: entities, camera: camera, view: camera.view, background: [1, 1, 1, 1] });
  (0, _imgUtils.writeContextToFile)(gl, width, height, 4, outputPath);
});

/*
fs.createReadStream(input)
.pipe(parsers[ext]) // we get a stream back
.on('data', function (geometry) {
  console.log('done with parsing') // , parsedData)
   render({entities: [], camera: {projection: null}, view: null, background: [1, 1, 1, 1]})
  writeContextToFile(gl, 256, 256, 4, outputPath)
})*/