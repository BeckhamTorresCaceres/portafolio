"use client";

import { JobItem } from "../types";

interface ExperienceSectionProps {
  experiences?: JobItem[];
}

export function ExperienceSection({ experiences = [] }: ExperienceSectionProps) {
  return (
    <section id="experience" className="min-h-screen px-4 sm:px-6 md:px-12 py-20 sm:py-32">
      <p className="font-mono text-accent text-sm mb-3 sm:mb-4 reveal">
        {"// experiencia"}
      </p>
      <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold reveal">
        Trayectoria.
      </h2>
      <div className="relative mt-12 sm:mt-16 max-w-3xl pl-6 sm:pl-8">
        <div className="tl-line absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-accent to-accent2" />
        {experiences.map((job, idx) => (
          <div
            key={job.y + idx}
            className="reveal relative mb-10 sm:mb-14 glass rounded-2xl p-5 sm:p-6"
          >
            <span className="absolute -left-[29px] sm:-left-[37px] top-7 sm:top-8 w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-accent shadow-[0_0_16px_var(--color-accent)]" />
            <p className="font-mono text-xs text-accent">{job.y}</p>
            <h3 className="text-xl sm:text-2xl font-medium mt-2">
              {job.r} <span className="text-fg/40">@ {job.c}</span>
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-fg/55 leading-relaxed">{job.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
