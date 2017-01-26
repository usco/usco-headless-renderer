#!/usr/bin/env node
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
// import make3mfStream from 'usco-3mf-parser'

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _most = require('most');

var _uscoCtmParser = require('usco-ctm-parser');

var _uscoCtmParser2 = _interopRequireDefault(_uscoCtmParser);

var _uscoObjParser = require('usco-obj-parser');

var _uscoObjParser2 = _interopRequireDefault(_uscoObjParser);

var _uscoStlParser = require('usco-stl-parser');

var _uscoStlParser2 = _interopRequireDefault(_uscoStlParser);

var _render = require('./render');

var _render2 = _interopRequireDefault(_render);

var _uscoImageUtils = require('usco-image-utils');

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

// ///////deal with command line args etc
var args = process.argv.slice(2);
if (args.length === 0) {
  console.log('usco-headless-renderer v' + version + '\n    use it like this : usco-headless-renderer <PATH-TO-FILE> \'320x240\' <PATH-TO-OUTPUT.png>\n    ');
}
if (args.length > 0) {
  (function () {
    // more advanced params handling , for later
    /*
      console.log("params",args)
      let params = args.reduce(function(cur,combo){
      let [name,val]= cur.split("=")
      combo[name] = val
    },{})*/

    var uri = args[0];

    var _args$1$split$map = args[1].split('x').map(function (e) {
      return parseInt(e, 10);
    }),
        _args$1$split$map2 = _slicedToArray(_args$1$split$map, 2),
        width = _args$1$split$map2[0],
        height = _args$1$split$map2[1];

    var outputPath = args[2] ? args[2] : uri + '.png';

    var _getNameAndExtension = (0, _uscoFileUtils.getNameAndExtension)(uri),
        ext = _getNameAndExtension.ext;

    var resolution = { width: width, height: height };

    // console.log('outputPath', outputPath, 'ext', ext)
    console.log('Running renderer with params', uri, resolution, outputPath);

    var parseOptions = { concat: true };
    var parsers = {
      'stl': (0, _uscoStlParser2.default)(parseOptions),
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
      if (ext === 'stl') {
        _fs2.default.createReadStream(uri).pipe(parsers[ext]) // we get a stream back
        .on('data', function (parsedData) {
          add(parsedData);
        });
      } else {
        var data = _fs2.default.readFileSync(uri, 'binary');
        var parsedObs$ = parsers[ext](data, {});
        parsedObs$.forEach(add);
      }
    });

    (0, _entityPrep2.default)(parsedData$, regl).forEach(function (entity) {
      var bounds = entity.bounds,
          transforms = entity.transforms;

      var controlParams = orbitControls.params;
      controlParams.limits.minDistance = 0;
      _camera.camera.near = 0.01;

      var camera = setProjection(_camera.camera, { width: width, height: height });
      camera = Object.assign({}, camera, (0, _uscoCameraUtils.cameraOffsetToEntityBoundsCenter)({ camera: camera, bounds: bounds, transforms: transforms, axis: 2 }));
      camera = Object.assign({}, camera, (0, _uscoCameraUtils.computeCameraToFitBounds)({ camera: camera, bounds: bounds, transforms: transforms }));
      camera = Object.assign({}, camera, orbitControls.update(controlParams, camera));

      render({ entities: [entity], camera: camera, view: camera.view, background: [1, 1, 1, 1] });
      (0, _uscoImageUtils.writeContextToFile)(gl, width, height, 4, outputPath);
    });

    /*
    fs.createReadStream(uri)
      .pipe(parsers[ext]) // we get a stream back
      .on('data', function (geometry) {
        console.log('done with parsing') // , parsedData)

        render({entities: [], camera: {projection: null}, view: null, background: [1, 1, 1, 1]})
        writeContextToFile(gl, 256, 256, 4, outputPath)
      })*/
  })();
}
