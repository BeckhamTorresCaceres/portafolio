"use client";

import { useState, useTransition } from "react";
import {
  createProject,
  updateProject,
  deleteProject,
  toggleProjectPublished,
} from "@/lib/admin/actions";

export interface ProjectData {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  stack: string[];
  coverImage: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  order: number;
  published: boolean;
  createdAt: Date;
}

export function ProjectsManager({ projects }: { projects: ProjectData[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isModalOpen = showCreateModal || editingProject !== null;

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingProject(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      let res;
      if (editingProject) {
        res = await updateProject(editingProject.id, formData);
      } else {
        res = await createProject(formData);
      }

      if (res?.error) {
        setError(res.error);
      } else {
        form.reset();
        closeModal();
      }
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`¿Eliminar el proyecto "${title}"? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      await deleteProject(id);
    });
  };

  const handleToggle = (id: string, currentPublished: boolean) => {
    startTransition(async () => {
      await toggleProjectPublished(id, !currentPublished);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h2 className="text-xl font-bold font-space text-white">Proyectos del Portafolio</h2>
          <p className="text-xs text-white/50 font-mono mt-0.5">
            Crea, edita o elimina los proyectos visibles en la vista pública.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setEditingProject(null);
            setShowCreateModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-cyan-500/20"
        >
          + Agregar Proyecto
        </button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/20">
          <p className="text-sm text-white/40 font-mono">No hay proyectos registrados aún.</p>
          <button
            onClick={() => {
              setError(null);
              setShowCreateModal(true);
            }}
            className="mt-3 text-xs text-cyan-400 font-mono hover:underline cursor-pointer"
          >
            Crea el primero haciendo clic aquí
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur space-y-4 flex flex-col justify-between hover:border-cyan-500/30 transition group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-cyan-400/80 uppercase tracking-widest">
                    ORDEN: #{p.order}
                  </span>
                  <button
                    onClick={() => handleToggle(p.id, p.published)}
                    disabled={isPending}
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full transition cursor-pointer ${
                      p.published
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                    }`}
                  >
                    {p.published ? "● Publicado" : "○ Borrador"}
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white font-space">{p.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
                  {p.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs font-mono">
                <div className="flex items-center gap-3 text-white/40">
                  {p.demoUrl && (
                    <a
                      href={p.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-cyan-400 transition"
                    >
                      Demo ↗
                    </a>
                  )}
                  {p.repoUrl && (
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-cyan-400 transition"
                    >
                      Repo ↗
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setShowCreateModal(false);
                      setEditingProject(p);
                    }}
                    disabled={isPending}
                    className="text-cyan-400 hover:text-cyan-300 transition cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    disabled={isPending}
                    className="text-rose-400/70 hover:text-rose-300 transition cursor-pointer"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Proyecto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            onClick={closeModal}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl border border-white/10 bg-slate-900 shadow-2xl z-10 space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white font-space">
                {editingProject ? `Editar Proyecto: ${editingProject.title}` : "Nuevo Proyecto"}
              </h3>
              <button
                onClick={closeModal}
                className="text-white/40 hover:text-white transition font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="text-xs text-rose-400 font-mono bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/20">
                {error}
              </p>
            )}

            <form
              key={editingProject ? editingProject.id : "new"}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-white/70 block">
                    Título del Proyecto *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    defaultValue={editingProject?.title ?? ""}
                    placeholder="Nebula Dashboard"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-white/70 block">
                    Slug (URL opcional)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    defaultValue={editingProject?.slug ?? ""}
                    placeholder="nebula-dashboard"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-white/70 block">
                  Descripción corta *
                </label>
                <textarea
                  name="description"
                  required
                  rows={2}
                  defaultValue={editingProject?.description ?? ""}
                  placeholder="Panel en tiempo real con WebSockets y WebGL..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-white/70 block">
                  Stack / Tecnologías (separadas por coma) *
                </label>
                <input
                  type="text"
                  name="stack"
                  required
                  defaultValue={editingProject ? editingProject.stack.join(", ") : ""}
                  placeholder="Next.js, Three.js, PostgreSQL, Tailwind"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-white/70 block">
                    Enlace Demo / Web
                  </label>
                  <input
                    type="url"
                    name="demoUrl"
                    defaultValue={editingProject?.demoUrl ?? ""}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-white/70 block">
                    Enlace Repositorio GitHub
                  </label>
                  <input
                    type="url"
                    name="repoUrl"
                    defaultValue={editingProject?.repoUrl ?? ""}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-white/70 block">
                    Orden de aparición
                  </label>
                  <input
                    type="number"
                    name="order"
                    defaultValue={editingProject ? editingProject.order : projects.length + 1}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    defaultChecked={editingProject ? editingProject.published : true}
                    className="w-4 h-4 rounded border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <label
                    htmlFor="published"
                    className="text-xs font-mono text-white/80 cursor-pointer select-none"
                  >
                    Publicar de inmediato
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-white/50 hover:text-white transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer"
                >
                  {isPending
                    ? editingProject
                      ? "Actualizando..."
                      : "Guardando..."
                    : editingProject
                    ? "Guardar Cambios"
                    : "Guardar Proyecto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
