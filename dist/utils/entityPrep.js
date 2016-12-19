'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = entityPrep;

var _uscoGeometryUtils = require('usco-geometry-utils');

var _uscoTransformUtils = require('usco-transform-utils');

var _prepHelpers = require('./prepHelpers');

var _uscoRenderer = require('usco-renderer');

/* Pipeline:
  - data => process (normals computation, color format conversion) => (drawCall generation) => drawCall
  - every object with a fundamentall different 'look' (beyond what can be done with shader parameters) => different (VS) & PS
  - even if regl can 'combine' various uniforms, attributes, props etc, the rule above still applies
*/

// helpers
function entityPrep(rawGeometry$, regl) {
  //NOTE : rotation needs to be manually inverted , or an additional geometry transformation applied
  var addedEntities$ = rawGeometry$.map(function (geometry) {
    return {
      transforms: { pos: [0, 0, 0], rot: [0, 0, Math.PI], sca: [1, 1, 1] }, // [0.2, 1.125, 1.125]},
      geometry: geometry,
      visuals: {
        type: 'mesh',
        visible: true,
        color: [0.02, 0.7, 1, 1] // 07a9ff [1, 1, 0, 0.5],
      },
      meta: { id: 0 } };
  }).map(_prepHelpers.injectNormals).map(_prepHelpers.injectBounds).map(function (data) {
    var geometry = (0, _uscoGeometryUtils.centerGeometry)(data.geometry, data.bounds, data.transforms);
    return Object.assign({}, data, { geometry: geometry });
  }).map(function (data) {
    var transforms = Object.assign({}, data.transforms, (0, _uscoTransformUtils.offsetTransformsByBounds)(data.transforms, data.bounds));
    var entity = Object.assign({}, data, { transforms: transforms });
    return entity;
  }).map(_prepHelpers.injectBounds) // we need to recompute bounds based on changes above
  .map(_prepHelpers.injectTMatrix)
  //.tap(entity => console.log('entity done processing', entity))
  .map(function (data) {
    var geometry = data.geometry;
    var draw = (0, _uscoRenderer.drawStaticMesh2)(regl, { geometry: geometry }); // one command per mesh, but is faster
    var visuals = Object.assign({}, data.visuals, { draw: draw });
    var entity = Object.assign({}, data, { visuals: visuals }); // Object.assign({}, data, {visuals: {draw}})
    return entity;
  }).multicast();

  return addedEntities$;
}