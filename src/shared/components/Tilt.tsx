"use client";

import { useRef } from "react";
import gsap from "gsap";

interface TiltProps {
  children: React.ReactNode;
  className?: string;
}

export function Tilt({ children, className = "" }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(ref.current, {
      rotationY: x * 16,
      rotationX: -y * 16,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 800,
    });
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, {
      rotationX: 0,
      rotationY: 0,
      duration: 0.6,
      ease: "power3.out",
    });
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: "preserve-3d", perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}
