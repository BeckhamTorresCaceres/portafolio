"use client";

import { Tilt } from "@/shared/components/Tilt";
import { SkillItem } from "../types";

export function SkillsSection({
  skills = [],
}: {
  skills?: SkillItem[];
} = {}) {
  return (
    <section
      id="skills"
      className="min-h-screen px-4 sm:px-6 md:px-12 py-20 sm:py-32 flex flex-col justify-center"
    >
      <p className="font-mono text-accent text-sm mb-3 sm:mb-4 reveal">{"// skills"}</p>
      <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold max-w-2xl reveal">
        Mi caja de herramientas.
      </h2>
      <div
        className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
        style={{ perspective: 1000 }}
      >
        {skills.map((skill) => (
          <Tilt key={skill.t} className="skill-card">
            <div className="glass rounded-2xl p-5 sm:p-7 h-56 sm:h-64 flex flex-col justify-between hover:border-accent/40 transition-colors">
              <span
                className="font-mono text-fg/30 text-xs sm:text-sm"
                style={{ transform: "translateZ(30px)" }}
              >
                {skill.n}
              </span>
              <div style={{ transform: "translateZ(50px)" }}>
                <h3 className="text-xl sm:text-2xl font-medium">{skill.t}</h3>
                <p className="mt-2 text-xs sm:text-sm text-fg/50 font-mono leading-relaxed">
                  {skill.d}
                </p>
              </div>
            </div>
          </Tilt>
        ))}
      </div>
    </section>
  );
}
