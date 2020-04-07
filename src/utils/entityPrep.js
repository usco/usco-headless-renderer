// helpers
/* import { centerGeometry } from 'usco-geometry-utils'
import { offsetTransformsByBounds } from 'usco-transform-utils'
import { drawStaticMesh2 as drawStaticMesh } from 'usco-render-utils'
import { injectNormals, injectTMatrix, injectBounds } from './prepHelpers.js' */

import geometryUtils from 'usco-geometry-utils'
const { centerGeometry } = geometryUtils

/* Pipeline:
  - data => process (normals computation, color format conversion) => (drawCall generation) => drawCall
  - every object with a fundamentall different 'look' (beyond what can be done with shader parameters) => different (VS) & PS
  - even if regl can 'combine' various uniforms, attributes, props etc, the rule above still applies
*/

export default function entityPrep (rawData$, regl) {
  // NOTE : rotation needs to be manually inverted , or an additional geometry transformation applied
  const addedEntities$ = rawData$
    .map(geometry => ({
      transforms: { pos: [0, 0, 0], rot: [0, 0, Math.PI], sca: [1, 1, 1] }, // [0.2, 1.125, 1.125]},
      geometry,
      visuals: {
        type: 'mesh',
        visible: true,
        color: [0.02, 0.7, 1, 1] // 07a9ff [1, 1, 0, 0.5],
      },
      meta: { id: 0 } })
    )
    .map(injectNormals)
    .map(injectBounds)
    .map(function (data) {
      const geometry = centerGeometry(data.geometry, data.bounds, data.transforms)
      return Object.assign({}, data, { geometry })
    })
    .map(function (data) {
      let transforms = Object.assign({}, data.transforms, offsetTransformsByBounds(data.transforms, data.bounds))
      const entity = Object.assign({}, data, { transforms })
      return entity
    })
    .map(injectBounds) // we need to recompute bounds based on changes above
    .map(injectTMatrix)
    // .tap(entity => console.log('entity done processing', entity))
    .map(function (data) {
      const geometry = data.geometry

      /* const indices = data.geometry.indices
      let indicesSub = []//new Uint32Array(indices.length/3)
      for(let i=0,j=0; i<indices.length;i+=3,j++){
        //indicesSub[j] = [indices[i], indices[i+1], indices[i+2]]
        indicesSub.push([indices[i], indices[i+1], indices[i+2]])
      }
      data.geometry.indices = indicesSub
      console.log('indices',indices.length) */

      if (!regl.hasExtension('oes_element_index_uint') && data.geometry.indices) {
        data.geometry.indices = Uint16Array.from(data.geometry.indices)
      }

      const draw = drawStaticMesh(regl, { geometry: geometry }) // one command per mesh, but is faster
      const visuals = Object.assign({}, data.visuals, { draw })
      const entity = Object.assign({}, data, { visuals }) // Object.assign({}, data, {visuals: {draw}})
      return entity
    })
    .multicast()

  return addedEntities$
}
