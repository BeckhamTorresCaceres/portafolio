"use client";

import { StatItem } from "../types";

const defaultStats: StatItem[] = [
  { number: "4", label: "años exp." },
  { number: "25", label: "proyectos" },
  { number: "10", label: "OSS repos" },
];

export function AboutSection({
  profile = {
    headline: "Código limpio, detalles cuidados.",
    bio: "Soy desarrollador con foco en arquitectura frontend y experiencias interactivas. Me gusta llevar una idea desde el diseño hasta producción, cuidando rendimiento, accesibilidad y mantenibilidad.",
  },
  stats = defaultStats,
}: {
  profile?: {
    headline?: string;
    bio?: string;
  };
  stats?: StatItem[];
} = {}) {
  const headline = profile.headline || "Código limpio, detalles cuidados.";
  const bio = profile.bio || "Soy desarrollador con foco en arquitectura frontend y experiencias interactivas.";

  return (
    <section
      id="about"
      className="min-h-screen flex items-center justify-start md:justify-end px-6 md:px-12 py-24"
    >
      <div className="max-w-xl glass rounded-3xl p-8 md:p-10 reveal">
        <p className="font-mono text-accent text-sm mb-4">{"// sobre mí"}</p>
        <h2 className="text-4xl md:text-5xl font-semibold leading-tight">
          {headline}
        </h2>
        <p className="mt-6 text-fg/60 leading-relaxed">{bio}</p>
        <div className="mt-10 grid grid-cols-3 gap-4 font-mono">
          {stats.map(({ number, label }) => (
            <div key={label}>
              <div className="text-4xl text-fg">
                <span className="count" data-to={number}>
                  0
                </span>
                +
              </div>
              <div className="text-xs text-fg/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
