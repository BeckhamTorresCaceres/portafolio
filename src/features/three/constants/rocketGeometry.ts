import * as THREE from "three";

export type V3 = [number, number, number];

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const ease = (t: number) => 1 - Math.pow(1 - t, 3);

// Seeded pseudo-random so the scattered layout is stable
export const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const ASSEMBLE_END = 0.3; // scroll progress at which the rocket is fully built
export const TOTAL_PARTS = 14;
export const STAG = 0.07;
export const R0 = 0.27;

export const rocketState = { built: 0 };

export const makeOgive = (R: number, H: number) => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const y = (i / 40) * H;
    pts.push(new THREE.Vector2(R * Math.pow(Math.max(0, 1 - y / H), 0.62), y));
  }
  return pts;
};

export const noseProfile = makeOgive(0.27, 0.75);

export const bellProfile = (() => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const s = i / 24;
    pts.push(new THREE.Vector2(0.17 + 0.23 * Math.pow(s, 0.55), -s * 0.55));
  }
  return pts;
})();

export const ENGINE_POS: [number, number][] = [
  [0, 0],
  ...Array.from({ length: 8 }, (_, i) => [
    Math.sin((i / 8) * Math.PI * 2) * 0.175,
    Math.cos((i / 8) * Math.PI * 2) * 0.175,
  ] as [number, number]),
];
