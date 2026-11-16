"use client";

import { RefObject } from "react";
import { projects } from "../data/portfolioData";

interface ProjectsSectionProps {
  trackRef: RefObject<HTMLDivElement | null>;
}

export function ProjectsSection({ trackRef }: ProjectsSectionProps) {
  return (
    <section
      id="projects"
      className="h-screen overflow-hidden flex flex-col justify-center"
    >
      <div className="px-6 md:px-12 mb-10">
        <p className="font-mono text-accent text-sm mb-3">{"// proyectos"}</p>
        <h2 className="text-4xl md:text-6xl font-semibold">
          Trabajo seleccionado.
        </h2>
      </div>
      <div
        ref={trackRef}
        className="flex gap-8 px-6 md:px-12 w-max"
        style={{ perspective: 1200 }}
      >
        {projects.map((project) => (
          <article
            key={project.n}
            className="project-card glass rounded-3xl w-[80vw] md:w-[520px] h-[48vh] p-8 flex flex-col justify-between relative overflow-hidden group"
          >
            <div
              className={`absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br ${project.c} to-transparent blur-3xl`}
            />
            <div className="relative flex justify-between font-mono text-sm text-fg/40">
              <span>{project.n}</span>
              <span className="group-hover:text-accent transition-colors">
                ↗ ver caso
              </span>
            </div>
            <div className="relative">
              <h3 className="text-3xl md:text-4xl font-semibold">{project.t}</h3>
              <p className="mt-3 text-fg/55 max-w-sm">{project.d}</p>
              <div className="mt-5 flex flex-wrap gap-2 font-mono text-xs">
                {project.s.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full border border-fg/15 text-fg/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
        <div className="w-[20vw]" />
      </div>
    </section>
  );
}
