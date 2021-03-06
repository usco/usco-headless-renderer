export const camera = {
  position: [75, 75, 145],
  target: [0, 0, 0],
  fov: Math.PI / 4,
  aspect: 1,

  projection: new Float32Array(16),
  view: new Float32Array(16),
  near: 10, // 0.01,
  far: 1300,
  up: [0, 0, 1],

  thetaDelta: 0,
  phiDelta: 0,
  scale: 1
}
