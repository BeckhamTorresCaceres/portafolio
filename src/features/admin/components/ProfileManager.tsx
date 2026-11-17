"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/admin/actions";

interface ProfileData {
  id: string;
  name: string;
  role: string;
  headline: string | null;
  description: string | null;
  bio: string;
  avatarUrl: string | null;
  email: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  cvUrl: string | null;
}

export function ProfileManager({ profile }: { profile: ProfileData | null }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ error?: string; success?: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res?.error) {
        setStatus({ error: res.error });
      } else {
        setStatus({ success: true });
        setTimeout(() => setStatus(null), 4000);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header bar */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-bold font-space text-white">Perfil y Datos Personales</h2>
        <p className="text-xs text-white/50 font-mono mt-0.5">
          Modifica tu información profesional, textos del Hero, biografía y enlaces sociales.
        </p>
      </div>

      {status?.error && (
        <p className="text-xs text-rose-400 font-mono bg-rose-950/40 p-3 rounded-xl border border-rose-500/20">
          {status.error}
        </p>
      )}

      {status?.success && (
        <p className="text-xs text-emerald-400 font-mono bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20">
          ¡Perfil actualizado correctamente en la base de datos!
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={profile?.name || "Beckham Torres Caceres"}
              className="w-full px-4 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block">
              Rol / Título Profesional *
            </label>
            <input
              type="text"
              name="role"
              required
              defaultValue={profile?.role || "Desarrollador Full-Stack"}
              className="w-full px-4 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block">
              Titular Corto (Headline)
            </label>
            <input
              type="text"
              name="headline"
              defaultValue={profile?.headline || "Código limpio, detalles cuidados."}
              className="w-full px-4 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block">
              Correo de Contacto *
            </label>
            <input
              type="email"
              name="email"
              required
              defaultValue={profile?.email || "beckhamjosethtorrescaceres@gmail.com"}
              className="w-full px-4 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block">
            Descripción del Hero
          </label>
          <input
            type="text"
            name="description"
            defaultValue={
              profile?.description ||
              "Desarrollador Full-Stack. Construyo productos web rápidos, escalables y con experiencias interactivas en 3D."
            }
            className="w-full px-4 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400 font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block">
            Biografía / Sobre mí *
          </label>
          <textarea
            name="bio"
            required
            rows={4}
            defaultValue={
              profile?.bio ||
              "Soy desarrollador con foco en arquitectura frontend y experiencias interactivas. Me gusta llevar una idea desde el diseño hasta producción, cuidando rendimiento, accesibilidad y mantenibilidad."
            }
            className="w-full px-4 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400 font-mono resize-none leading-relaxed"
          />
        </div>

        {/* Social Links */}
        <div className="pt-3 border-t border-white/5 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Enlaces Sociales & Documentos
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/60 block">GitHub URL</label>
              <input
                type="url"
                name="githubUrl"
                defaultValue={profile?.githubUrl || "https://github.com/BeckhamTorresCaceres"}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/60 block">LinkedIn URL</label>
              <input
                type="url"
                name="linkedinUrl"
                defaultValue={profile?.linkedinUrl || ""}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/60 block">Twitter / X URL</label>
              <input
                type="url"
                name="twitterUrl"
                defaultValue={profile?.twitterUrl || ""}
                placeholder="https://x.com/..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {isPending ? "Guardando cambios..." : "Guardar Perfil"}
          </button>
        </div>
      </form>
    </div>
  );
}
