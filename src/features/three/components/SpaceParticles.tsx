"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/theme/colors";
import { scrollState } from "@/shared/lib/scrollState";

interface SpaceParticlesProps {
  light: boolean;
}

export function SpaceParticles({ light }: SpaceParticlesProps) {
  const ref = useRef<THREE.Points>(null!);
  const { lighting: lc } = colors.three;

  const positions = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const count = isMobile ? 650 : 1400;
    const a = new Float32Array(count * 3);
    for (let i = 0; i < a.length; i++) {
      a[i] = (Math.random() - 0.5) * 22;
    }
    return a;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.02;
    ref.current.position.y = scrollState.progress * 6;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={light ? 0.035 : 0.025}
        color={light ? lc.particleLight : lc.particleDark}
        transparent
        opacity={light ? 0.5 : 0.7}
        sizeAttenuation
      />
    </points>
  );
}
