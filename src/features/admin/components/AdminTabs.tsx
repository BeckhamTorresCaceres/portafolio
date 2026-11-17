"use client";

import { useState } from "react";
import { ProjectsManager } from "./ProjectsManager";
import { SkillsManager } from "./SkillsManager";
import { ProfileManager } from "./ProfileManager";
import { ExperienceManager } from "./ExperienceManager";

interface AdminTabsProps {
  projects: any[];
  skills: any[];
  experiences: any[];
  profile: any | null;
  comments: any[];
  toggleCommentAction: (id: string, newStatus: "visible" | "hidden") => Promise<any>;
  deleteCommentAction: (id: string) => Promise<any>;
}

export function AdminTabs({
  projects,
  skills,
  experiences,
  profile,
  comments,
  toggleCommentAction,
  deleteCommentAction,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "experience" | "profile" | "skills" | "comments">("projects");

  const tabs = [
    { id: "projects", label: `Proyectos (${projects.length})` },
    { id: "experience", label: `Trayectoria (${experiences.length})` },
    { id: "profile", label: "Perfil & Bio" },
    { id: "skills", label: `Habilidades (${skills.length})` },
    { id: "comments", label: `Comentarios (${comments.length})` },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900/60 border border-white/10 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/30 backdrop-blur-xl p-6 sm:p-8">
        {activeTab === "projects" && <ProjectsManager projects={projects} />}
        {activeTab === "experience" && <ExperienceManager experiences={experiences} />}
        {activeTab === "profile" && <ProfileManager profile={profile} />}
        {activeTab === "skills" && <SkillsManager skills={skills} />}
        {activeTab === "comments" && (
          <div className="space-y-6">
            <div className="pb-4 border-b border-white/5">
              <h2 className="text-xl font-bold font-space text-white">Moderación de Comentarios</h2>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Revisa, oculta o elimina los comentarios publicados por los visitantes.
              </p>
            </div>

            {comments.length === 0 ? (
              <div className="p-12 text-center text-sm font-mono text-white/30">
                No hay comentarios registrados en la base de datos.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">
                          {comment.userName}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            comment.status === "visible"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {comment.status}
                        </span>
                        <span className="text-[10px] text-white/40 font-mono">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={async () => {
                          await toggleCommentAction(
                            comment.id,
                            comment.status === "visible" ? "hidden" : "visible"
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 text-xs font-mono text-white/70 hover:text-white transition cursor-pointer"
                      >
                        {comment.status === "visible" ? "Ocultar" : "Mostrar"}
                      </button>

                      <button
                        onClick={async () => {
                          if (confirm("¿Eliminar este comentario permanentemente?")) {
                            await deleteCommentAction(comment.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-xs font-mono text-rose-300 transition cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
