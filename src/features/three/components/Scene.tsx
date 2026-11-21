"use client";

import { Canvas } from "@react-three/fiber";
import { colors } from "@/theme/colors";
import { Rocket } from "./Rocket/Rocket";
import { SpaceParticles } from "./SpaceParticles";
import { FallingStars } from "./FallingStars";

interface SceneProps {
  light: boolean;
}

export function Scene({ light }: SceneProps) {
  const { lighting: lc } = colors.three;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={isMobile ? [1, 1.3] : [1, 1.75]}
        gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={light ? 0.6 : 0.35} />
        <directionalLight
          position={[5, 8, 6]}
          intensity={light ? 2.6 : 1.2}
          color={light ? lc.sunLight : lc.sunDark}
        />
        <directionalLight
          position={[-6, -4, -3]}
          intensity={light ? 1.5 : 0.5}
          color={light ? lc.fillLight : lc.fillDark}
        />
        <pointLight
          position={[4, 4, 4]}
          intensity={light ? 35 : 55}
          color={lc.pointCyan}
        />
        <pointLight
          position={[-5, -3, 2]}
          intensity={light ? 35 : 45}
          color={lc.pointBlue}
        />
        <Rocket light={light} />
        <SpaceParticles light={light} />
        <FallingStars light={light} />
      </Canvas>
    </div>
  );
}

export default Scene;
