// works in client & server
import mat4 from 'gl-mat4'
import shadersMesh from './shaders/meshShaders.js'
import shadersVColors from './shaders/vColorShaders.js'

export default function drawMesh (regl, params = { extras: {} }) {
  const { prop, buffer } = regl
  const defaults = {
    dynamicCulling: false,
    geometry: undefined
  }
  let { geometry, dynamicCulling } = Object.assign({}, defaults, params)

  dynamicCulling = false
  // vertex colors or not ?
  const hasIndices = ('indices' in geometry && geometry.indices.length > 0)
  const hasNormals = ('normals' in geometry && geometry.normals.length > 0)
  const hasVertexColors = ('colors' in geometry && geometry.colors.length > 0)
  const cullFace = dynamicCulling ? function (context, props) {
    const isOdd = ([props.model[0], props.model[5], props.model[10]].filter(x => x < 0).length) & 1 // count the number of negative components & deterine if that is odd or even
    return isOdd ? 'front' : 'back'
  } : 'back'

  // console.log('has vertex colors', hasVertexColors)

  const vert = hasVertexColors ? shadersVColors.vert : shadersMesh.vert
  const frag = hasVertexColors ? shadersVColors.frag : shadersMesh.frag

  let commandParams = {
    vert,
    frag,

    uniforms: {
      model: (context, props) => props.model || mat4.identity([]),
      ucolor: prop('color'),
      printableArea: (context, props) => props.printableArea || [0, 0]
    },
    attributes: {
      position: buffer(geometry.positions)
      // color: { constant: [1, 0, 0, 1] }
    },
    cull: {
      enable: true,
      face: cullFace
    },
    blend: {
      enable: true,
      func: {
        src: 'src alpha',
        dst: 'one minus src alpha'
      }
    }
  }

  if (geometry.cells) {
    commandParams.elements = geometry.cells
  } else if (hasIndices) {
    // FIXME: not entirely sure about all this
    const indices = geometry.indices
    /* let type
    if (indices instanceof Uint32Array && regl.hasExtension('oes_element_index_uint')) {
      type = 'uint32'
    }else if (indices instanceof Uint16Array) {
      type = 'uint16'
    } else {
      type = 'uint8'
    } */

    commandParams.elements = regl.elements({
      // type,
      data: indices
    })
  } else {
    commandParams.count = geometry.positions.length / 3
  }

  if (hasNormals) {
    commandParams.attributes.normal = buffer(geometry.normals)
  }
  if (hasVertexColors) {
    commandParams.attributes.color = buffer(geometry.colors)
  }

  // Splice in any extra params
  commandParams = Object.assign({}, commandParams, params.extras)
  return regl(commandParams)
}
