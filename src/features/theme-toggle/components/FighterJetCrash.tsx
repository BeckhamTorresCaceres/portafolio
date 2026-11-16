"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { colors } from "@/theme/colors";

interface FighterJetCrashProps {
  active: boolean;
  targetRef: React.RefObject<HTMLButtonElement | null>;
  onImpact: () => void;
  onComplete: () => void;
}

export function FighterJetCrash({
  active,
  targetRef,
  onImpact,
  onComplete,
}: FighterJetCrashProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const jetRef = useRef<HTMLDivElement>(null);
  const lockOnRef = useRef<HTMLDivElement>(null);
  const shockwaveRef = useRef<HTMLDivElement>(null);

  const onImpactRef = useRef(onImpact);
  onImpactRef.current = onImpact;
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const runningRef = useRef(false);

  useEffect(() => {
    if (!active || !targetRef.current) {
      runningRef.current = false;
      return;
    }

    if (runningRef.current) return;
    runningRef.current = true;

    const target = targetRef.current;
    const targetRect = target.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    const jet = jetRef.current;
    const lockOn = lockOnRef.current;
    const shockwave = shockwaveRef.current;

    if (!jet || !lockOn || !shockwave) return;

    // Position Lock-on reticle over button
    gsap.set(lockOn, {
      left: targetX,
      top: targetY,
      xPercent: -50,
      yPercent: -50,
      opacity: 1,
      scale: 1.5,
    });

    gsap.to(lockOn, {
      scale: 1,
      duration: 0.25,
      ease: "power2.out",
    });

    // Start position of Jet (offscreen from bottom-left)
    const startX = -150;
    const startY = window.innerHeight * 0.8;

    // Mid waypoint
    const midX = window.innerWidth * 0.42;
    const midY = window.innerHeight * 0.35;

    // Calculate angle
    const angleToTarget =
      (Math.atan2(targetY - midY, targetX - midX) * 180) / Math.PI + 90;

    gsap.set(jet, {
      x: startX,
      y: startY,
      scale: 0.55,
      rotation: angleToTarget - 25,
      opacity: 1,
      transformOrigin: "center center",
      force3D: true,
    });

    // Main animation timeline
    const tl = gsap.timeline({
      onComplete: () => {
        runningRef.current = false;
        onCompleteRef.current();
      },
    });

    // High-speed flight animation (0.38s total flight time)
    tl.to(jet, {
      x: midX,
      y: midY,
      scale: 1.05,
      rotation: angleToTarget - 10,
      duration: 0.22,
      ease: "power2.in",
      force3D: true,
    }).to(jet, {
      x: targetX,
      y: targetY,
      scale: 0.8,
      rotation: angleToTarget,
      duration: 0.16,
      ease: "power4.in",
      force3D: true,
      onComplete: () => {
        // --- MOMENT OF IMPACT ---
        gsap.set(jet, { opacity: 0 });
        gsap.set(lockOn, { opacity: 0 });

        // Trigger the theme change
        onImpactRef.current();

        // 1. Micro-recoil hit on the button itself (0 repaint on the rest of the page)
        gsap.fromTo(
          target,
          { scale: 0.82, x: 5, y: 5 },
          {
            scale: 1,
            x: 0,
            y: 0,
            duration: 0.35,
            ease: "elastic.out(1.2, 0.3)",
            clearProps: "transform",
          }
        );

        // 2. Light Sonic Boom Shockwave ring
        gsap.set(shockwave, {
          left: targetX,
          top: targetY,
          xPercent: -50,
          yPercent: -50,
          scale: 0.2,
          opacity: 0.9,
        });
        gsap.to(shockwave, {
          scale: 6,
          opacity: 0,
          duration: 0.45,
          ease: "power2.out",
        });
      },
    });

    // Wait for the shockwave to finish
    tl.to({}, { duration: 0.35 });

    return () => {
      tl.kill();
    };
  }, [active, targetRef]);

  if (!active) return null;

  const { jet: jc } = colors;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
    >
      {/* Light Sonic Boom Shockwave ring (GPU accelerated, 0 filters) */}
      <div
        ref={shockwaveRef}
        className="absolute w-14 h-14 rounded-full border-2 border-accent opacity-0 pointer-events-none z-30"
      />

      {/* Target Reticle HUD Lock-On */}
      <div
        ref={lockOnRef}
        className="absolute w-16 h-16 opacity-0 pointer-events-none z-25 flex items-center justify-center font-mono"
      >
        <div className="absolute inset-0 border-2 border-dashed border-red-500 rounded-full animate-spin" />
        <div className="absolute -top-5 text-[9px] text-red-500 font-bold tracking-widest bg-black/80 px-1 rounded border border-red-500/50">
          LOCK ON
        </div>
        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
      </div>

      {/* Supersonic Fighter Jet (F-22 style stealth fighter) */}
      <div
        ref={jetRef}
        className="absolute top-0 left-0 w-24 h-32 opacity-0 pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2"
      >
        <svg
          viewBox="0 0 120 150"
          className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Jet Metal Body Gradient */}
            <linearGradient id="fuselage" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={jc.fuselageStart} />
              <stop offset="50%" stopColor={jc.fuselageMid} />
              <stop offset="100%" stopColor={jc.fuselageEnd} />
            </linearGradient>

            {/* Wing Gradient */}
            <linearGradient id="wings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={jc.wingsStart} />
              <stop offset="100%" stopColor={jc.wingsEnd} />
            </linearGradient>

            {/* Cockpit Golden/Cyan Reflection */}
            <linearGradient id="canopy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={jc.canopyGold} stopOpacity="0.9" />
              <stop offset="60%" stopColor={jc.canopyCyan} stopOpacity="0.8" />
              <stop offset="100%" stopColor={jc.canopyDark} />
            </linearGradient>

            {/* Afterburner Thruster Flame */}
            <linearGradient id="afterburner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={jc.flameWhite} />
              <stop offset="35%" stopColor={jc.flameCyan} />
              <stop offset="70%" stopColor={jc.flameOrange} />
              <stop offset="100%" stopColor={jc.flameRed} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Afterburner Thruster Plumes */}
          <g>
            <polygon
              points="48,118 45,145 54,118"
              fill="url(#afterburner)"
            />
            <polygon
              points="66,118 75,145 72,118"
              fill="url(#afterburner)"
            />
          </g>

          {/* Wingtip Condensation Trails */}
          <line
            x1="8"
            y1="96"
            x2="0"
            y2="140"
            stroke={jc.trail}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="112"
            y1="96"
            x2="120"
            y2="140"
            stroke={jc.trail}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Main Wings & Trailing Flaps */}
          <polygon
            points="60,35 114,96 86,104 60,116 34,104 6,96"
            fill="url(#wings)"
            stroke={jc.border}
            strokeWidth="1.2"
          />

          {/* Wing Paneling */}
          <polygon
            points="60,40 102,93 84,98 60,105 36,98 18,93"
            fill={jc.panel}
            opacity="0.85"
          />

          {/* Twin Vertical Cant Tail Fins */}
          <polygon
            points="44,95 38,124 48,122 52,98"
            fill={jc.fin}
            stroke={jc.border}
            strokeWidth="1"
          />
          <polygon
            points="76,95 82,124 72,122 68,98"
            fill={jc.fin}
            stroke={jc.border}
            strokeWidth="1"
          />

          {/* Twin Horizontal Stabilizers */}
          <polygon
            points="34,114 16,134 32,135 48,122"
            fill={jc.stabilizer}
          />
          <polygon
            points="86,114 104,134 88,135 72,122"
            fill={jc.stabilizer}
          />

          {/* Main Fuselage Body */}
          <polygon
            points="60,4 72,40 70,116 60,118 50,116 48,40"
            fill="url(#fuselage)"
            stroke={jc.canopyDark}
            strokeWidth="1.2"
          />

          {/* Air Intakes Left & Right */}
          <polygon points="42,52 48,50 48,85 40,82" fill={jc.intake} />
          <polygon points="78,52 72,50 72,85 80,82" fill={jc.intake} />

          {/* Jet Cockpit Canopy with Golden Reflection */}
          <ellipse
            cx="60"
            cy="42"
            rx="5"
            ry="18"
            fill="url(#canopy)"
            stroke={jc.canopyDark}
            strokeWidth="1"
          />
          <path
            d="M58,26 Q60,24 62,26 L61,38 Q60,39 59,38 Z"
            fill={jc.flameWhite}
            opacity="0.6"
          />

          {/* Engine Exhaust Nozzles */}
          <ellipse cx="49" cy="118" rx="3.8" ry="2" fill={jc.canopyDark} />
          <ellipse cx="71" cy="118" rx="3.8" ry="2" fill={jc.canopyDark} />
        </svg>
      </div>
    </div>
  );
}

export default FighterJetCrash;
