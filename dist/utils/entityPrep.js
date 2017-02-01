'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = entityPrep;

var _uscoGeometryUtils = require('usco-geometry-utils');

var _uscoTransformUtils = require('usco-transform-utils');

var _prepHelpers = require('./prepHelpers');

var _uscoRenderUtils = require('usco-render-utils');

/* Pipeline:
  - data => process (normals computation, color format conversion) => (drawCall generation) => drawCall
  - every object with a fundamentall different 'look' (beyond what can be done with shader parameters) => different (VS) & PS
  - even if regl can 'combine' various uniforms, attributes, props etc, the rule above still applies
*/

// helpers
function entityPrep(rawData$, regl) {
  // NOTE : rotation needs to be manually inverted , or an additional geometry transformation applied
  var addedEntities$ = rawData$.map(function (geometry) {
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
  // .tap(entity => console.log('entity done processing', entity))
  .map(function (data) {
    var geometry = data.geometry;

    /*const indices = data.geometry.indices
    let indicesSub = []//new Uint32Array(indices.length/3)
    for(let i=0,j=0; i<indices.length;i+=3,j++){
      //indicesSub[j] = [indices[i], indices[i+1], indices[i+2]]
      indicesSub.push([indices[i], indices[i+1], indices[i+2]])
    }
    data.geometry.indices = indicesSub
    console.log('indices',indices.length)*/

    if (!regl.hasExtension('oes_element_index_uint') && data.geometry.indices) {
      data.geometry.indices = Uint16Array.from(data.geometry.indices);
    }

    var draw = (0, _uscoRenderUtils.drawStaticMesh2)(regl, { geometry: geometry }); // one command per mesh, but is faster
    var visuals = Object.assign({}, data.visuals, { draw: draw });
    var entity = Object.assign({}, data, { visuals: visuals }); // Object.assign({}, data, {visuals: {draw}})
    return entity;
  }).multicast();

  return addedEntities$;
}