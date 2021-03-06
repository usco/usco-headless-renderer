import boundUtils from 'usco-bounds-utils'

import geometryUtils from 'usco-geometry-utils'
import transformUtils from 'usco-transform-utils'

/* import { computeBounds } from 'usco-bounds-utils'
import { computeTMatrixFromTransforms } from 'usco-transform-utils'
import { computeNormalsFromUnindexedPositions, doNormalsNeedComputing } from 'usco-geometry-utils' */

const { computeBounds } = boundUtils
const { computeTMatrixFromTransforms } = transformUtils
const { computeNormalsFromUnindexedPositions, doNormalsNeedComputing } = geometryUtils

// inject bounding box(& co) data
export function injectBounds (entity) {
  const bounds = computeBounds(entity)
  const result = Object.assign({}, entity, { bounds })
  // console.log('data with bounds', result)
  return result
}

// inject object transformation matrix : costly : only do it when changes happened to objects
export function injectTMatrix (entity) {
  const modelMat = computeTMatrixFromTransforms(entity.transforms)
  const result = Object.assign({}, entity, { modelMat })
  return result
}

// inject normals
export function injectNormals (entity) {
  const { geometry } = entity
  // FIXME: not entirely sure we should always recompute it, but we had cases of files with normals specified, but wrong
  // let tmpGeometry = reindex(geometry.positions)
  // geometry.normals = normals(tmpGeometry.cells, tmpGeometry.positions)
  geometry.normals = doNormalsNeedComputing(geometry) ? computeNormalsFromUnindexedPositions(geometry.positions) : geometry.normals
  const result = Object.assign({}, entity, { geometry })
  return result
}
