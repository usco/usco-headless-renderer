
import { makeWrapperScope } from './render-utils/index.js'

export default function prepareRender (regl, params) {
  const wrapperScope = makeWrapperScope(regl)

  let command = (props) => {
    const { entities, camera, view, background } = props

    wrapperScope(props, (context) => {
      regl.clear({
        color: background,
        depth: 1
      })
      entities.map(function (entity) {
        entity.visuals.draw({ view, camera, color: entity.visuals.color, model: entity.modelMat })
      })
    })
  }

  return function render (data) {
    command(data)
  }
}
