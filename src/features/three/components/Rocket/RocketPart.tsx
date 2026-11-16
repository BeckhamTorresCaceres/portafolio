"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/shared/lib/scrollState";
import {
  ASSEMBLE_END,
  clamp01,
  ease,
  rnd,
  STAG,
  TOTAL_PARTS,
  V3,
} from "../../constants/rocketGeometry";

interface RocketPartProps {
  idx: number;
  to: V3;
  rot?: V3;
  children: React.ReactNode;
}

export function RocketPart({
  idx,
  to,
  rot = [0, 0, 0],
  children,
}: RocketPartProps) {
  const ref = useRef<THREE.Group>(null!);

  const from = useMemo<V3>(() => {
    const a = rnd(idx, 1) * Math.PI * 2;
    const r = 3 + rnd(idx, 2) * 2.5;
    return [Math.cos(a) * r, (rnd(idx, 3) - 0.5) * 6, Math.sin(a) * r * 0.6 - 1];
  }, [idx]);

  const fromRot = useMemo<V3>(
    () => [rnd(idx, 4) * 6, rnd(idx, 5) * 6, rnd(idx, 6) * 6],
    [idx]
  );

  useFrame((state) => {
    const t = ease(
      clamp01(
        (scrollState.progress / ASSEMBLE_END) * (1 + (TOTAL_PARTS - 1) * STAG) -
          idx * STAG
      )
    );
    const g = ref.current;
    if (!g) return;
    const drift = (1 - t) * Math.sin(state.clock.elapsedTime + idx) * 0.25;
    g.position.set(
      THREE.MathUtils.lerp(from[0], to[0], t),
      THREE.MathUtils.lerp(from[1], to[1], t) + drift,
      THREE.MathUtils.lerp(from[2], to[2], t)
    );
    g.rotation.set(
      THREE.MathUtils.lerp(fromRot[0] + state.clock.elapsedTime * 0.3, rot[0], t),
      THREE.MathUtils.lerp(fromRot[1] + state.clock.elapsedTime * 0.2, rot[1], t),
      THREE.MathUtils.lerp(fromRot[2], rot[2], t)
    );
  });

  return <group ref={ref}>{children}</group>;
}
