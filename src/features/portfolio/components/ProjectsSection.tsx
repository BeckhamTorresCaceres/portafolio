"use client";

import { RefObject } from "react";
import { ProjectItem } from "../types";

interface ProjectsSectionProps {
  trackRef: RefObject<HTMLDivElement | null>;
  projects?: ProjectItem[];
}

export function ProjectsSection({
  trackRef,
  projects = [],
}: ProjectsSectionProps) {
  return (
    <section
      id="projects"
      className="h-screen overflow-hidden flex flex-col justify-center"
    >
      <div className="px-4 sm:px-6 md:px-12 mb-6 sm:mb-10">
        <p className="font-mono text-accent text-sm mb-2 sm:mb-3">{"// proyectos"}</p>
        <h2 className="text-3xl sm:text-4xl md:text-6xl font-semibold">
          Trabajo seleccionado.
        </h2>
      </div>
      <div
        ref={trackRef}
        className="flex gap-5 sm:gap-8 px-4 sm:px-6 md:px-12 w-max"
        style={{ perspective: 1200 }}
      >
        {projects.map((project) => (
          <article
            key={project.n}
            className="project-card glass rounded-2xl sm:rounded-3xl w-[86vw] sm:w-[80vw] md:w-[520px] min-h-[380px] h-[54vh] sm:h-[48vh] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shrink-0"
          >
            <div
              className={`absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br ${project.c} to-transparent blur-3xl`}
            />
            <div className="relative flex justify-between font-mono text-xs sm:text-sm text-fg/40 z-10">
              <span>{project.n}</span>
              <div className="flex items-center gap-3">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent transition-colors flex items-center gap-0.5 cursor-pointer text-xs"
                  >
                    demo ↗
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-accent transition-colors flex items-center gap-0.5 cursor-pointer text-xs"
                  >
                    repo ↗
                  </a>
                )}
                {!project.demoUrl && !project.repoUrl && (
                  <span className="group-hover:text-accent transition-colors">
                    ↗ ver caso
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold">{project.t}</h3>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-fg/55 max-w-sm leading-relaxed">{project.d}</p>
              <div className="mt-4 sm:mt-5 flex flex-wrap gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs">
                {project.s.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-fg/15 text-fg/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
