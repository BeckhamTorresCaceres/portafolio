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
  { id: "contact", label: "Contacto", code: "06" },
];

export function ScrollIndicator({ onNavigate }: ScrollIndicatorProps) {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const p = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      setProgress(p);

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${p})`;
      }

      // Determinar la sección activa
      const middleY = scrollY + window.innerHeight * 0.4;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const top = el.offsetTop;
          if (middleY >= top) {
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
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScrollThrottled);
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

      {/* 2. Riel lateral HUD */}
      <aside
        aria-label="Navegación de secciones"
        className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3 font-mono text-xs select-none pointer-events-auto"
      >
        <div className="flex items-center gap-1.5 text-[10px] text-fg/30 tracking-widest uppercase mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
          <span>NAV // {String(percentage).padStart(2, "0")}%</span>
        </div>

        <div className="glass rounded-2xl px-2.5 py-4 flex flex-col gap-3.5 border border-fg/10 shadow-lg">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => onNavigate(`#${sec.id}`)}
                aria-label={`Ir a sección ${sec.label}`}
                className="group flex items-center justify-end gap-2.5 cursor-pointer py-1 text-right focus:outline-none"
              >
                <span
                  className={`text-[11px] font-mono tracking-wider transition-all duration-300 ${
                    isActive
                      ? "text-accent font-semibold opacity-100 translate-x-0"
                      : "text-fg/40 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                  }`}
                >
                  {sec.label}
                </span>

                <div className="relative flex items-center justify-center w-5 h-5">
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-3 h-3 bg-accent shadow-[0_0_10px_var(--color-accent)] scale-110"
                        : "w-1.5 h-1.5 bg-fg/30 group-hover:bg-fg/70 group-hover:scale-125"
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

        <div className="text-[10px] text-fg/40 tracking-wider">
          ALT: <span className="text-accent">{percentage}k</span>
        </div>
      </aside>
    </>
  );
}

export default ScrollIndicator;
