"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import * as THREE from "three";

export function SceneEnvironment({ light }: { light: boolean }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);

  useEffect(() => {
    scene.environmentIntensity = light ? 0.75 : 0.55;
  }, [scene, light]);

  return null;
}
