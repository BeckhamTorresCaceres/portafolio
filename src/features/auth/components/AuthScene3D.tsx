"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FloatingCore() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const t = timeRef.current;
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.25;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.PI / 4 + Math.sin(t * 0.5) * 0.2;
      ringRef.current.rotation.y = t * 0.4;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -Math.PI / 4 + Math.cos(t * 0.4) * 0.2;
      ring2Ref.current.rotation.z = -t * 0.3;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central icosahedron wireframe */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, 1]} />
        <meshBasicMaterial
          color="#7cf5c4"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Primary orbital ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.2, 0.015, 16, 64]} />
        <meshBasicMaterial
          color="#6c8cff"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Secondary orbital ring */}
      <mesh ref={ring2Ref}>
        <torusGeometry args={[2.6, 0.012, 16, 64]} />
        <meshBasicMaterial
          color="#7cf5c4"
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

function StarField() {
  const pointsRef = useRef<THREE.Points>(null!);
  const count = 600;

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;
    positions[i + 1] = (Math.random() - 0.5) * 20;
    positions[i + 2] = (Math.random() - 0.5) * 20;
  }

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#7cf5c4"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function AuthScene3D() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#7cf5c4" />
        <pointLight position={[-5, -5, -5]} intensity={0.8} color="#6c8cff" />
        <FloatingCore />
        <StarField />
      </Canvas>
    </div>
  );
}
