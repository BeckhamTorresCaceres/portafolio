"use client";

import { colors } from "@/theme/colors";

export function RocketFin() {
  const { rocket: rc } = colors.three;

  const mat = (
    <meshStandardMaterial color={rc.gridFin} metalness={0.9} roughness={0.4} />
  );

  return (
    <group>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[0.22, 0.018, 0.035]} />
        {mat}
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[0.22, 0.018, 0.035]} />
        {mat}
      </mesh>
      <mesh position={[0.11, 0, 0]}>
        <boxGeometry args={[0.018, 0.2, 0.035]} />
        {mat}
      </mesh>
      <mesh position={[-0.11, 0, 0]}>
        <boxGeometry args={[0.018, 0.2, 0.035]} />
        {mat}
      </mesh>
      {[-0.055, 0, 0.055].map((v) => (
        <group key={v}>
          <mesh position={[v, 0, 0]}>
            <boxGeometry args={[0.007, 0.2, 0.03]} />
            {mat}
          </mesh>
          <mesh position={[0, v, 0]}>
            <boxGeometry args={[0.22, 0.007, 0.03]} />
            {mat}
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[0.04, 0.04, 0.05]} />
        {mat}
      </mesh>
    </group>
  );
}
