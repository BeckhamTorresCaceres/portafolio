"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/theme/colors";
import { rnd } from "../constants/rocketGeometry";
import { makeSoftSprite } from "../textures/makeSoftSprite";

const STARS = 46;

interface FallingStarsProps {
  light: boolean;
}

export function FallingStars({ light }: FallingStarsProps) {
  const lines = useRef<THREE.LineSegments>(null!);
  const heads = useRef<THREE.Points>(null!);
  const sprite = useMemo(makeSoftSprite, []);
  const { lighting: lc } = colors.three;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const starCount = isMobile ? 22 : STARS;

  const data = useMemo(
    () =>
      Array.from({ length: starCount }, (_, i) => ({
        x: (rnd(i, 11) - 0.5) * (isMobile ? 18 : 26),
        y: (rnd(i, 12) - 0.5) * 16,
        z: -2 - rnd(i, 13) * 6,
        speed: 3 + rnd(i, 14) * 6,
        len: 0.7 + rnd(i, 15) * 1.8,
      })),
    [starCount, isMobile]
  );

  const linePos = useMemo(() => new Float32Array(starCount * 6), [starCount]);
  const lineCol = useMemo(() => new Float32Array(starCount * 6), [starCount]);
  const headPos = useMemo(() => new Float32Array(starCount * 3), [starCount]);
  const dir = useMemo(() => new THREE.Vector2(-0.35, -1).normalize(), []);
  const head = useMemo(() => new THREE.Color(), []);
  const tail = useMemo(() => new THREE.Color(), []);

  useFrame((_, dt) => {
    if (!lines.current || !heads.current) return;
    head.set(light ? lc.starHeadLight : lc.starHeadDark);
    tail.set(light ? lc.starTailLight : lc.starTailDark);
    const d = Math.min(dt, 0.05);

    data.forEach((st, i) => {
      st.x += dir.x * st.speed * d;
      st.y += dir.y * st.speed * d;
      if (st.y < -8 || st.x < -14) {
        st.x = (Math.random() - 0.3) * 26;
        st.y = 8 + Math.random() * 4;
      }
      const hx = st.x;
      const hy = st.y;
      linePos.set(
        [hx, hy, st.z, hx - dir.x * st.len, hy - dir.y * st.len, st.z],
        i * 6
      );
      lineCol.set([head.r, head.g, head.b, tail.r, tail.g, tail.b], i * 6);
      headPos.set([hx, hy, st.z], i * 3);
    });

    lines.current.geometry.attributes.position.needsUpdate = true;
    lines.current.geometry.attributes.color.needsUpdate = true;
    heads.current.geometry.attributes.position.needsUpdate = true;
  });

  const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;

  return (
    <>
      <lineSegments ref={lines} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineCol, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.9}
          blending={blending}
          depthWrite={false}
        />
      </lineSegments>
      <points ref={heads} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[headPos, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={sprite}
          color={light ? lc.starPointLight : lc.starPointDark}
          size={0.16}
          transparent
          depthWrite={false}
          sizeAttenuation
          blending={blending}
        />
      </points>
    </>
  );
}
