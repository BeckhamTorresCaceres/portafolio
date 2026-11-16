"use client";

import { developerProfile } from "../data/portfolioData";

interface HeroSectionProps {
  onNavigate: (id: string) => void;
}

export function HeroSection({ onNavigate }: HeroSectionProps) {
  const { name, description } = developerProfile;

  return (
    <section
      id="hero"
      className="min-h-screen flex items-center px-6 md:px-12 relative"
    >
      <div className="hero-content max-w-3xl">
        <p className="hero-fade font-mono text-accent text-sm mb-6">
          <span className="text-fg/40">$</span> whoami
          <span className="cursor-blink">_</span>
        </p>
        <h1
          className="text-6xl md:text-8xl font-bold leading-[0.95] tracking-tight"
          style={{ perspective: 600 }}
        >
          {["Hola, soy", name].map((line, li) => (
            <span key={li} className="block overflow-hidden pb-2">
              {line.split("").map((ch, i) => (
                <span
                  key={i}
                  className={`hero-char inline-block ${
                    li === 1
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent2"
                      : ""
                  }`}
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="hero-fade mt-8 text-lg md:text-xl text-fg/60 max-w-xl">
          {description}
        </p>
        <div className="hero-fade mt-10 flex gap-4 font-mono text-sm">
          <button
            onClick={() => onNavigate("#projects")}
            className="px-6 py-3 rounded-full bg-accent text-on-accent font-medium hover:scale-105 transition-transform"
          >
            ver proyectos
          </button>
          <button
            onClick={() => onNavigate("#contact")}
            className="px-6 py-3 rounded-full glass hover:bg-fg/10 transition-colors"
          >
            contacto
          </button>
        </div>
      </div>
      <div className="hero-fade absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-fg/40 flex flex-col items-center gap-2">
        scroll
        <span className="w-px h-10 bg-gradient-to-b from-fg/50 to-transparent" />
      </div>
    </section>
  );
}
