"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/theme/colors";
import { rnd, rocketState } from "../../constants/rocketGeometry";
import { makeSoftSprite } from "../../textures/makeSoftSprite";

const TRAIL = 90;

interface RocketExhaustProps {
  light: boolean;
}

export function RocketExhaust({ light }: RocketExhaustProps) {
  const ref = useRef<THREE.Points>(null!);
  const sprite = useMemo(makeSoftSprite, []);
  const { rocket: rc } = colors.three;

  const seed = useMemo(
    () => Array.from({ length: TRAIL }, (_, i) => [rnd(i, 7), rnd(i, 8), rnd(i, 9)]),
    []
  );

  const pos = useMemo(() => new Float32Array(TRAIL * 3), []);
  const col = useMemo(() => new Float32Array(TRAIL * 3), []);
  const hot = useMemo(() => new THREE.Color(rc.exhaustHot), [rc.exhaustHot]);
  const cool = useMemo(() => new THREE.Color(), []);
  const tmp = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    cool.set(light ? rc.exhaustCoolLight : rc.exhaustCoolDark);

    for (let i = 0; i < TRAIL; i++) {
      const age = (t * 0.7 + seed[i][0]) % 1;
      const sp = 0.3 + age * 0.6;
      pos[i * 3] = (seed[i][1] - 0.5) * sp;
      pos[i * 3 + 1] = -age * 3.2;
      pos[i * 3 + 2] = (seed[i][2] - 0.5) * sp;
      tmp.copy(hot).lerp(cool, Math.min(1, age * 1.15));
      col[i * 3] = tmp.r;
      col[i * 3 + 1] = tmp.g;
      col[i * 3 + 2] = tmp.b;
    }

    const geo = ref.current.geometry;
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    (ref.current.material as THREE.PointsMaterial).opacity =
      rocketState.built * 0.55;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
        <bufferAttribute attach="attributes-color" args={[col, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        vertexColors
        size={0.42}
        transparent
        depthWrite={false}
        sizeAttenuation
        blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}
