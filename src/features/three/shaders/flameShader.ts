export const flameVert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const flameFrag = `
varying vec2 vUv;
uniform float uTime;
uniform float uPower;

void main() {
  float h = vUv.y;
  float a = pow(1.0 - h, 1.6);
  float fl = 0.78 + 0.22 * sin(uTime * 38.0 + h * 14.0) * sin(uTime * 23.0 + h * 6.0);
  vec3 col = mix(vec3(1.0, 0.97, 0.85), vec3(1.0, 0.38, 0.08), smoothstep(0.0, 0.8, h));
  gl_FragColor = vec4(col, a * fl * uPower);
}
`;
