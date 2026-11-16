"use client";

import { colors } from "@/theme/colors";
import { R0 } from "../../constants/rocketGeometry";

export function RocketLeg() {
  const { rocket: rc } = colors.three;

  const mat = (
    <meshStandardMaterial color={rc.legPrimary} metalness={0.7} roughness={0.35} />
  );
  const dk = (
    <meshStandardMaterial color={rc.legDark} metalness={0.8} roughness={0.4} />
  );

  return (
    <group position={[0, -0.5, R0 + 0.025]}>
      <mesh rotation={[-0.09, 0, 0]}>
        <boxGeometry args={[0.045, 0.95, 0.045]} />
        {mat}
      </mesh>
      <mesh position={[0.04, -0.12, -0.015]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[0.014, 0.7, 0.014]} />
        {dk}
      </mesh>
      <mesh position={[-0.04, -0.12, -0.015]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[0.014, 0.7, 0.014]} />
        {dk}
      </mesh>
      <mesh position={[0, -0.47, 0.075]}>
        <boxGeometry args={[0.1, 0.025, 0.1]} />
        {dk}
      </mesh>
      <mesh position={[0, 0.42, -0.01]}>
        <boxGeometry args={[0.08, 0.08, 0.06]} />
        {dk}
      </mesh>
    </group>
  );
}
