"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";

interface CyberCard3DProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export function CyberCard3D({
  children,
  className = "",
  maxWidth = "max-w-md",
}: CyberCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });

  // Entrance animation on mount
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        scale: 0.88,
        rotationX: 18,
        y: 40,
      },
      {
        opacity: 1,
        scale: 1,
        rotationX: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      }
    );
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setShine({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.18,
    });

    gsap.to(cardRef.current, {
      rotationY: x * 22,
      rotationX: -y * 22,
      duration: 0.45,
      ease: "power2.out",
      transformPerspective: 1000,
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    setShine((prev) => ({ ...prev, opacity: 0 }));
    gsap.to(cardRef.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.7,
      ease: "power3.out",
    });
  };

  return (
    <div
      style={{ perspective: "1200px" }}
      className={`w-full ${maxWidth} relative select-none`}
    >
      {/* 3D Tilting Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: "preserve-3d",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 45px -10px rgba(124, 245, 196, 0.18)",
        }}
        className={`relative rounded-3xl border border-white/10 bg-slate-950/80 backdrop-blur-2xl p-7 sm:p-9 overflow-hidden transition-colors ${className}`}
      >
        {/* Dynamic Holographic Surface Reflection */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: shine.opacity,
            background: `radial-gradient(circle 320px at ${shine.x}% ${shine.y}%, rgba(124, 245, 196, 0.28), transparent 70%)`,
          }}
        />

        {/* Animated Cyber Scanning Beam */}
        <div
          className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30 pointer-events-none animate-[scan_4s_linear_infinite]"
          style={{
            boxShadow: "0 0 15px rgba(124, 245, 196, 0.8)",
          }}
        />

        {/* Aerospace HUD Corner Brackets */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400/70 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400/70 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400/70 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400/70 pointer-events-none" />

        {/* Tactical HUD Header Bar */}
        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/60 pb-4 mb-2 border-b border-white/5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>SYS.AUTH // LVL-01</span>
          </div>
          <span>NODE: SECURE_POSTGRES</span>
        </div>

        {/* Interactive Children with 3D Depth */}
        <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
