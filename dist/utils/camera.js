"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var camera = exports.camera = {
  position: [75, 75, 145],
  target: [0, 0, 0],
  fov: Math.PI / 4,
  aspect: 1,

  projection: new Float32Array(16),
  view: new Float32Array(16),
  near: 10, // 0.01,
  far: 1300,

  thetaDelta: 0,
  phiDelta: 0,
  scale: 1
};