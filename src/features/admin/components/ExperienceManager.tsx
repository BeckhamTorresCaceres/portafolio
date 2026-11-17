"use client";

import { useState, useTransition } from "react";
import {
  createExperience,
  updateExperience,
  deleteExperience,
} from "@/lib/admin/actions";

export interface ExperienceData {
  id: string;
  period: string;
  role: string;
  company: string;
  description: string;
  order: number;
}

export function ExperienceManager({
  experiences,
}: {
  experiences: ExperienceData[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createExperience(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        form.reset();
      }
    });
  };

  const handleUpdate = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateExperience(id, formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setEditingId(null);
      }
    });
  };

  const handleDelete = (id: string, role: string, company: string) => {
    if (!confirm(`¿Eliminar la experiencia "${role} en ${company}"?`)) return;
    startTransition(async () => {
      await deleteExperience(id);
    });
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-bold font-space text-white">Trayectoria & Experiencia</h2>
        <p className="text-xs text-white/50 font-mono mt-0.5">
          Gestiona las etapas profesionales y roles que se muestran en la línea de tiempo del portafolio.
        </p>
      </div>

      {/* Add Experience Form */}
      <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
        <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider mb-4">
          + Agregar Nueva Trayectoria
        </h3>

        {error && (
          <p className="text-xs text-rose-400 font-mono bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/20 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-white/70 block">
                Periodo *
              </label>
              <input
                type="text"
                name="period"
                required
                placeholder="Ej: 2023 — Actual o 2021 — 2023"
                className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-white/70 block">
                Cargo / Rol *
              </label>
              <input
                type="text"
                name="role"
                required
                placeholder="Ej: Senior Full-Stack Developer"
                className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-white/70 block">
                Empresa / Organización *
              </label>
              <input
                type="text"
                name="company"
                required
                placeholder="Ej: Tech Corp, Freelance..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="space-y-1 sm:col-span-3">
              <label className="text-[11px] font-mono text-white/70 block">
                Descripción del trabajo y logros *
              </label>
              <textarea
                name="description"
                rows={2}
                required
                placeholder="Liderazgo técnico, arquitecturas creadas, impacto o responsabilidades..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-white/70 block">
                Orden (menor = primero)
              </label>
              <input
                type="number"
                name="order"
                defaultValue={experiences.length + 1}
                className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="py-2 px-5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              {isPending ? "Guardando..." : "Guardar Trayectoria"}
            </button>
          </div>
        </form>
      </div>

      {/* List of Experiences */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono text-white/50 uppercase tracking-wider">
          Trayectorias Registradas ({experiences.length})
        </h3>

        {experiences.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-white/30 border border-white/5 rounded-2xl bg-white/[0.01]">
            No hay trayectorias registradas. Agrega una arriba.
          </div>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition"
              >
                {editingId === exp.id ? (
                  <form
                    onSubmit={(e) => handleUpdate(exp.id, e)}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        name="period"
                        defaultValue={exp.period}
                        required
                        className="px-2.5 py-1.5 text-xs rounded border border-white/20 bg-slate-900 text-white font-mono"
                      />
                      <input
                        type="text"
                        name="role"
                        defaultValue={exp.role}
                        required
                        className="px-2.5 py-1.5 text-xs rounded border border-white/20 bg-slate-900 text-white font-mono"
                      />
                      <input
                        type="text"
                        name="company"
                        defaultValue={exp.company}
                        required
                        className="px-2.5 py-1.5 text-xs rounded border border-white/20 bg-slate-900 text-white font-mono"
                      />
                    </div>
                    <textarea
                      name="description"
                      defaultValue={exp.description}
                      rows={2}
                      required
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-white/20 bg-slate-900 text-white font-mono"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/50">Orden:</span>
                        <input
                          type="number"
                          name="order"
                          defaultValue={exp.order}
                          className="w-16 px-2 py-1 text-xs rounded border border-white/20 bg-slate-900 text-white font-mono"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded text-xs font-mono text-white/50 hover:text-white"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-bold text-xs font-mono"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono">
                          {exp.period}
                        </span>
                        <span className="font-semibold text-sm text-white">
                          {exp.role}
                        </span>
                        <span className="text-xs text-white/50 font-mono">
                          @ {exp.company}
                        </span>
                      </div>
                      <p className="text-xs text-white/70 max-w-2xl leading-relaxed">
                        {exp.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <span className="text-[10px] font-mono text-white/30 mr-1">
                        #{exp.order}
                      </span>
                      <button
                        onClick={() => setEditingId(exp.id)}
                        className="px-2.5 py-1 rounded text-[11px] font-mono bg-white/5 hover:bg-white/10 text-white/80 transition cursor-pointer"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id, exp.role, exp.company)}
                        className="px-2.5 py-1 rounded text-[11px] font-mono bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
