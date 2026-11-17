"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollIndicatorProps {
  onNavigate: (id: string) => void;
}

const sections = [
  { id: "hero", label: "Inicio", code: "01" },
  { id: "about", label: "Sobre mí", code: "02" },
  { id: "skills", label: "Skills", code: "03" },
  { id: "projects", label: "Proyectos", code: "04" },
  { id: "experience", label: "Experiencia", code: "05" },
  { id: "comments", label: "Comentarios", code: "06" },
  { id: "contact", label: "Contacto", code: "07" },
];

export function ScrollIndicator({ onNavigate }: ScrollIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const maxScroll = docHeight - winHeight;

      const p = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      setProgress(p);

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }

      // 1. Edge case: top of the page
      if (scrollY < 120) {
        setActiveSection("hero");
        return;
      }

      // 2. Edge case: bottom of the page
      if (scrollY + winHeight >= docHeight - 80) {
        setActiveSection(sections[sections.length - 1].id);
        return;
      }

      // 3. Precision detection using viewport boundaries
      const targetLine = winHeight * 0.45;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= targetLine && rect.bottom >= targetLine) {
            setActiveSection(sections[i].id);
            break;
          }
        }
      }
    };

    const onScrollThrottled = () => {
      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScrollThrottled, { passive: true });
    window.addEventListener("resize", onScrollThrottled, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScrollThrottled);
      window.removeEventListener("resize", onScrollThrottled);
      cancelAnimationFrame(animId);
    };
  }, []);

  const percentage = Math.round(progress * 100);

  return (
    <>
      {/* 1. Barra láser superior */}
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50 pointer-events-none bg-fg/10">
        <div
          ref={barRef}
          className="relative h-full w-full origin-left bg-gradient-to-r from-accent via-accent2 to-emerald-400"
          style={{
            transform: "scaleX(0)",
            boxShadow:
              "0 0 10px var(--color-accent), 0 0 20px var(--color-accent2)",
          }}
        >
          {/* Cabeza de cometa */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9),0_0_24px_var(--color-accent)] animate-pulse" />
        </div>
      </div>

      {/* 2. Riel lateral HUD a la derecha */}
      <aside
        aria-label="Navegación de secciones"
        className="fixed right-3 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-end gap-2.5 font-mono text-xs select-none pointer-events-auto"
      >
        {/* Status header */}
        <div className="flex items-center gap-1.5 text-[9px] text-fg/40 tracking-widest uppercase mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
          <span>NAV // {String(percentage).padStart(2, "0")}%</span>
        </div>

        {/* HUD Navigation Rail Card */}
        <div className="glass rounded-2xl px-2.5 py-3.5 flex flex-col gap-2.5 border border-fg/10 shadow-2xl relative backdrop-blur-xl">
          {/* Vertical Connecting Rail Line */}
          <div className="absolute right-[19px] top-6 bottom-6 w-[1px] bg-fg/10 pointer-events-none" />

          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => onNavigate(`#${sec.id}`)}
                aria-label={`Ir a sección ${sec.label}`}
                className="group flex items-center justify-end gap-2 cursor-pointer py-1 text-right focus:outline-none relative z-10"
              >
                {/* Floating Section Label on hover or active */}
                <span
                  className={`text-[10px] font-mono tracking-wider transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-accent font-semibold opacity-100 translate-x-0"
                      : "text-fg/40 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0"
                  }`}
                >
                  {sec.label}
                </span>

                {/* Tactical Dot with Outer Ping */}
                <div className="relative flex items-center justify-center w-5 h-5">
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-2.5 h-2.5 bg-accent shadow-[0_0_12px_var(--color-accent)] scale-125"
                        : "w-1.5 h-1.5 bg-fg/25 group-hover:bg-fg/80 group-hover:scale-125"
                    }`}
                  />
                  {isActive && (
                    <div className="absolute inset-0 rounded-full border border-accent/60 animate-ping" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tactical Telemetry Altitude */}
        <div className="text-[9px] text-fg/40 tracking-wider font-mono">
          ALT: <span className="text-accent">{percentage}k</span>
        </div>
      </aside>
    </>
  );
}

export default ScrollIndicator;
