"use client";

import { useState, useTransition } from "react";
import { createSkill, deleteSkill } from "@/lib/admin/actions";

interface SkillData {
  id: string;
  name: string;
  category: string;
  order: number;
}

const CATEGORIES = ["Frontend", "Backend", "3D & Motion", "DevOps", "Herramientas"];

export function SkillsManager({ skills }: { skills: SkillData[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await createSkill(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        form.reset();
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Eliminar la habilidad "${name}"?`)) return;
    startTransition(async () => {
      await deleteSkill(id);
    });
  };

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-bold font-space text-white">Habilidades & Tecnologías</h2>
        <p className="text-xs text-white/50 font-mono mt-0.5">
          Gestiona las tecnologías que dominas y que se muestran en la sección de Skills.
        </p>
      </div>

      {/* Add Skill Form */}
      <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
        <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider mb-4">
          + Agregar Nueva Habilidad
        </h3>

        {error && (
          <p className="text-xs text-rose-400 font-mono bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/20 mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="space-y-1 sm:col-span-2">
            <label className="text-[11px] font-mono text-white/70 block">
              Tecnología o Habilidad *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Ej: React, Next.js, Three.js, Docker..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/5 text-white placeholder-white/20 focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-white/70 block">
              Categoría *
            </label>
            <select
              name="category"
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-slate-900 text-white focus:outline-none focus:border-cyan-400 font-mono"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-500/20"
            >
              {isPending ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </form>
      </div>

      {/* Skills Grouped by Category */}
      <div className="space-y-6">
        {CATEGORIES.map((category) => {
          const categorySkills = skills.filter((s) => s.category === category);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-widest text-cyan-400/80 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {category} ({categorySkills.length})
              </h4>

              <div className="flex flex-wrap gap-2">
                {categorySkills.map((s) => (
                  <div
                    key={s.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 transition group"
                  >
                    <span className="text-xs font-medium text-white/90">{s.name}</span>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      disabled={isPending}
                      aria-label={`Eliminar ${s.name}`}
                      className="text-white/30 hover:text-rose-400 text-xs font-mono transition cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {skills.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed border-white/10 text-white/40 text-xs font-mono">
            Aún no has agregado habilidades a la base de datos.
          </div>
        )}
      </div>
    </div>
  );
}
