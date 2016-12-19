'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.toArrayBuffer = toArrayBuffer;
exports.postProcessParsedData = postProcessParsedData;

var _three = require('three');

var _three2 = _interopRequireDefault(_three);

var _meshUtils = require('../../../utils/meshUtils');

var _glViewHelpers = require('glView-helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var centerMesh = _glViewHelpers.meshTools.centerMesh;


// see http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

// TODO: refactor ,same as assetManager/utils
function postProcessParsedData(data) {
  if ('objects' in data) {
    var _ret = function () {

      /* this renderers all objects in black ??
      let wrapper = new THREE.Object3D()
      wrapper.castShadow= false
      wrapper.receiveShadow= false*/

      var mesh = void 0;
      // for 3mf , etc
      var typesMetaHash = {};
      var typesMeshes = [];
      var typesMeta = [];

      var mainGeometry = new _three2.default.Geometry();
      //
      // we need to make ids unique
      var idLookup = {};

      for (var objectId in data.objects) {
        // console.log("objectId",objectId, data.objects[objectId])
        var item = data.objects[objectId];

        /*let meta = {id: item.id, name: item.name}
        // special color handling
        if (item.colors && item.colors.length > 0) {
          meta.color = '#FFFFFF'
        }
        typesMeta.push(meta)
        typesMetaHash[typeUid] = meta*/

        /*mesh = geometryFromBuffers(item)
        mesh = postProcessMesh(mesh)
        mesh = centerMesh(mesh)
        if (item.colors && item.colors.length > 0) {
          mesh.material.color = '#FFFFFF'
        }
        idLookup[item.id] = mesh*/
        //typesMeshes.push({typeUid, mesh})

        mesh = (0, _meshUtils.geometryFromBuffers)(item);
        mesh = (0, _meshUtils.postProcessMesh)(mesh);
        idLookup[item.id] = mesh;
      }

      data.build.map(function (item) {
        var tgtMesh = idLookup[item.objectid].clone();

        tgtMesh.updateMatrix();
        var geom = new _three2.default.Geometry().fromBufferGeometry(tgtMesh.geometry);
        mainGeometry.merge(geom, tgtMesh.matrix);

        //wrapper.add(tgtMesh)

        /*instMeta.push({instUid, typeUid: id}) // TODO : auto generate name
        if ('transforms' in item) {
          instTransforms.push({instUid, transforms: item.transforms})
        } else {
          instTransforms.push({instUid, transforms: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]})
        }*/
      });

      //mesh = postProcessMesh(mainGeometry)
      var material = new _three2.default.MeshPhongMaterial({ color: 0x17a9f5, specular: 0xffffff, shininess: 5, shading: _three2.default.FlatShading });

      mesh = new _three2.default.Mesh(mainGeometry, material);
      mesh = centerMesh(mesh);
      mesh.geometry.computeFaceNormals();
      mesh.geometry.computeVertexNormals(); // n
      return {
        v: mesh
      }; // wrapper // .children[0]
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } else {
    var _mesh = data;
    _mesh = (0, _meshUtils.geometryFromBuffers)(_mesh);
    _mesh = (0, _meshUtils.postProcessMesh)(_mesh);
    _mesh = centerMesh(_mesh);
    return _mesh;
  }
}