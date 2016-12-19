'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = prepareRender;

var _uscoRenderer = require('usco-renderer');

function prepareRender(regl, params) {
  var wrapperScope = (0, _uscoRenderer.wrapperScope)(regl);

  var command = function command(props) {
    var entities = props.entities,
        camera = props.camera,
        view = props.view,
        background = props.background;


    wrapperScope(props, function (context) {
      regl.clear({
        color: background,
        depth: 1
      });
      entities.map(function (entity) {
        entity.visuals.draw({ view: view, camera: camera, color: entity.visuals.color, model: entity.modelMat });
      });
    });
  };

  return function render(data) {
    command(data);
  };
}