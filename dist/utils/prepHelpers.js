'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectBounds = injectBounds;
exports.injectTMatrix = injectTMatrix;
exports.injectNormals = injectNormals;

var _uscoBoundsUtils = require('usco-bounds-utils');

var _uscoTransformUtils = require('usco-transform-utils');

var _uscoGeometryUtils = require('usco-geometry-utils');

// inject bounding box(& co) data
function injectBounds(entity) {
  var bounds = (0, _uscoBoundsUtils.computeBounds)(entity);
  var result = Object.assign({}, entity, { bounds: bounds });
  // console.log('data with bounds', result)
  return result;
}

// inject object transformation matrix : costly : only do it when changes happened to objects
function injectTMatrix(entity) {
  var modelMat = (0, _uscoTransformUtils.computeTMatrixFromTransforms)(entity.transforms);
  var result = Object.assign({}, entity, { modelMat: modelMat });
  // console.log('result', result)
  return result;
}

// inject normals
function injectNormals(entity) {
  var geometry = entity.geometry;
  // FIXME: not entirely sure we should always recompute it, but we had cases of files with normals specified, but wrong
  // let tmpGeometry = reindex(geometry.positions)
  // geometry.normals = normals(tmpGeometry.cells, tmpGeometry.positions)

  geometry.normals = (0, _uscoGeometryUtils.doNormalsNeedComputing)(geometry) ? (0, _uscoGeometryUtils.computeNormalsFromUnindexedPositions)(geometry.positions) : geometry.normals;
  var result = Object.assign({}, entity, { geometry: geometry });
  return result;
}