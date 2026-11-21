"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { colors } from "@/theme/colors";
import { scrollState } from "@/shared/lib/scrollState";
import {
  ASSEMBLE_END,
  bellProfile,
  clamp01,
  ENGINE_POS,
  noseProfile,
  R0,
  rocketState,
} from "../../constants/rocketGeometry";
import { makeHullTexture } from "../../textures/makeHullTexture";
import { flameFrag, flameVert } from "../../shaders/flameShader";
import { RocketPart } from "./RocketPart";
import { RocketLeg } from "./RocketLeg";
import { RocketFin } from "./RocketFin";
import { RocketExhaust } from "./RocketExhaust";
import { SceneEnvironment } from "../SceneEnvironment";

interface RocketProps {
  light: boolean;
}

export function Rocket({ light }: RocketProps) {
  const group = useRef<THREE.Group>(null!);
  const flame = useRef<THREE.Group>(null!);
  const glow = useRef<THREE.PointLight>(null!);
  const ring = useRef<THREE.Mesh>(null!);

  const { rocket: rc } = colors.three;
  const hullSoot = useMemo(() => makeHullTexture(true), []);
  const hull = useMemo(() => makeHullTexture(false), []);

  const flameMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: flameVert,
        fragmentShader: flameFrag,
        uniforms: { uTime: { value: 0 }, uPower: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useEffect(() => {
    flameMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    flameMat.needsUpdate = true;
  }, [light, flameMat]);

  useFrame((state, dt) => {
    const p = scrollState.progress;
    const t = state.clock.elapsedTime;
    const m = state.pointer;
    const built = clamp01((p / ASSEMBLE_END - 0.95) * 20);
    rocketState.built = built;

    const isMobile = state.viewport.width < 5.5;
    const xAmp = isMobile ? 0.85 : 2.3;
    const targetScale = isMobile ? 0.6 : 0.82;

    const tx = Math.cos(p * Math.PI * 3) * xAmp;
    const ty = Math.cos(p * Math.PI * 2) * 0.4 + built * Math.sin(t * 1.5) * 0.06;
    const tz = -Math.abs(Math.sin(p * Math.PI * 2)) * (isMobile ? 1.0 : 1.5);

    const g = group.current;
    if (!g) return;

    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, targetScale, 3, dt));
    g.position.x = THREE.MathUtils.damp(g.position.x, tx, 3, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, ty, 3, dt);
    g.position.z = THREE.MathUtils.damp(g.position.z, tz, 3, dt);
    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      p * Math.PI * 4 + m.x * (isMobile ? 0.25 : 0.5),
      3,
      dt
    );
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -0.3 + m.y * 0.1, 3, dt);

    const f = built * (0.92 + Math.sin(t * 30) * 0.06);
    if (flame.current) {
      flame.current.scale.set(f, f * (1 + Math.sin(t * 25) * 0.12), f);
    }
    flameMat.uniforms.uTime.value = t;
    flameMat.uniforms.uPower.value = built;

    if (glow.current) {
      glow.current.intensity = built * (6 + Math.sin(t * 40) * 1.2);
    }
    if (ring.current) {
      ring.current.rotation.x = t * 0.3 + p * 8;
      ring.current.rotation.y = t * 0.2;
      ring.current.scale.setScalar(3.1 * (0.4 + built * 0.6));
    }
  });

  const dark = (
    <meshStandardMaterial color={rc.darkStructure} metalness={0.9} roughness={0.35} />
  );
  const metal = (
    <meshStandardMaterial
      color={rc.metalEngine}
      metalness={1}
      roughness={0.28}
      side={THREE.DoubleSide}
    />
  );
  const chrome = (
    <meshStandardMaterial color={rc.chrome} metalness={1} roughness={0.12} />
  );
  const white = (tex: THREE.Texture, bump = 1) => (
    <meshStandardMaterial
      map={tex}
      bumpMap={tex}
      bumpScale={bump}
      metalness={0.35}
      roughness={0.4}
      side={THREE.DoubleSide}
    />
  );

  const legAngles = [0, 1, 2, 3].map((k) => (k * Math.PI) / 2);
  const finAngles = [0, 1, 2, 3].map((k) => Math.PI / 4 + (k * Math.PI) / 2);

  const viewport = useThree((state) => state.viewport);
  const baseScale = viewport.width < 5 ? 0.95 : 1.35;

  return (
    <group ref={group} scale={baseScale}>
      <SceneEnvironment light={light} />
      <group position={[0, -0.9, 0]}>
        {/* 0 - first stage tank (soot at the base, cable raceway, brand stripe) */}
        <RocketPart idx={0} to={[0, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[R0, R0, 1.9, 64, 1, true]} />
            {white(hullSoot)}
          </mesh>
          <group rotation={[0, 1.2, 0]}>
            <mesh position={[0, 0, R0 + 0.008]}>
              <boxGeometry args={[0.05, 1.85, 0.02]} />
              {dark}
            </mesh>
          </group>
          {[-0.45, 0.2].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[R0 + 0.003, 0.006, 8, 64]} />
              {dark}
            </mesh>
          ))}
        </RocketPart>

        {/* 1 - octaweb: thrust plate + 9 Merlin engines */}
        <RocketPart idx={1} to={[0, 0, 0]}>
          <mesh position={[0, -0.97, 0]}>
            <cylinderGeometry args={[R0, R0 - 0.02, 0.07, 48]} />
            {dark}
          </mesh>
          {ENGINE_POS.map(([x, z], i) => (
            <group key={i} position={[x, -1.0, z]} scale={[0.2, 0.36, 0.2]}>
              <mesh>
                <latheGeometry args={[bellProfile, 24]} />
                {metal}
              </mesh>
              <mesh position={[0, 0.12, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 0.25, 16]} />
                {chrome}
              </mesh>
            </group>
          ))}
        </RocketPart>

        {/* 2 - black interstage */}
        <RocketPart idx={2} to={[0, 1.05, 0]}>
          <mesh>
            <cylinderGeometry args={[R0 + 0.004, R0 + 0.004, 0.22, 48]} />
            <meshStandardMaterial color={rc.interstage} metalness={0.8} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.115, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R0 + 0.004, 0.008, 8, 48]} />
            {chrome}
          </mesh>
        </RocketPart>

        {/* 3 - second stage */}
        <RocketPart idx={3} to={[0, 1.46, 0]}>
          <mesh>
            <cylinderGeometry args={[R0, R0, 0.6, 64, 1, true]} />
            {white(hull, 0.8)}
          </mesh>
          <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R0 + 0.003, 0.007, 8, 64]} />
            {dark}
          </mesh>
        </RocketPart>

        {/* 4 - payload fairing, cylindrical section */}
        <RocketPart idx={4} to={[0, 2.01, 0]}>
          <mesh>
            <cylinderGeometry args={[R0 + 0.01, R0 + 0.01, 0.5, 64, 1, true]} />
            {white(hull, 0.6)}
          </mesh>
          <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[R0 + 0.01, 0.005, 8, 64]} />
            {dark}
          </mesh>
        </RocketPart>

        {/* 5 - payload fairing, ogive nose */}
        <RocketPart idx={5} to={[0, 2.26, 0]}>
          <mesh>
            <latheGeometry args={[noseProfile, 64]} />
            <meshStandardMaterial map={hull} metalness={0.35} roughness={0.35} />
          </mesh>
        </RocketPart>

        {/* 6-9 - landing legs (stowed) */}
        {legAngles.map((a, i) => (
          <RocketPart key={`leg${i}`} idx={6 + i} to={[0, 0, 0]} rot={[0, a, 0]}>
            <RocketLeg />
          </RocketPart>
        ))}

        {/* 10-13 - titanium grid fins */}
        {finAngles.map((a, i) => (
          <RocketPart key={`gf${i}`} idx={10 + i} to={[0, 0, 0]} rot={[0, a, 0]}>
            <group position={[0, 0.78, R0 + 0.03]}>
              <RocketFin />
            </group>
          </RocketPart>
        ))}

        {/* engine flames, ignite once assembled */}
        <group position={[0, -1.2, 0]}>
          <group ref={flame}>
            {ENGINE_POS.map(([x, z], i) => (
              <mesh
                key={i}
                position={[x, i === 0 ? -0.65 : -0.5, z]}
                rotation={[Math.PI, 0, 0]}
                material={flameMat}
              >
                <coneGeometry
                  args={[i === 0 ? 0.1 : 0.075, i === 0 ? 1.3 : 1.0, 20, 1, true]}
                />
              </mesh>
            ))}
          </group>
          <pointLight
            ref={glow}
            position={[0, -0.6, 0.3]}
            color={rc.glowLight}
            distance={5}
            intensity={0}
          />
          <RocketExhaust light={light} />
        </group>
      </group>

      <mesh ref={ring}>
        <torusGeometry args={[1, 0.006, 8, 120]} />
        <meshBasicMaterial
          color={light ? rc.ringLight : rc.ringDark}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}
