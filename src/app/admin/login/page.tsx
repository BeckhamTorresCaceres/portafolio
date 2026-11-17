"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { loginAdmin, AuthState } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { CyberCard3D } from "@/features/auth/components/CyberCard3D";

const AuthScene3D = dynamic(
  () =>
    import("@/features/auth/components/AuthScene3D").then(
      (mod) => mod.AuthScene3D
    ),
  { ssr: false }
);

const initialState: AuthState = {};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // If already authenticated, completely block the login view and redirect
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const email = data.user.email?.toLowerCase();
        const adminEmail = (
          process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
          "beckhamjosethtorrescaceres@gmail.com"
        ).toLowerCase();

        if (email === adminEmail) {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      }
    });
  }, [router]);

  const handleBackToPublic = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExiting) return;
    setIsExiting(true);

    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        scale: 0.82,
        rotationX: -20,
        y: 40,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => {
          router.push("/");
        },
      });
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#07080c] text-white relative overflow-hidden">
      {/* 3D Aerospace Background Scene */}
      <AuthScene3D />

      {/* Cyber Grid Overlay with Radial Vignette */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Interactive 3D Tilting Card with Exit Transition Wrapper */}
      <div ref={contentRef} style={{ perspective: "1000px" }} className="w-full max-w-md">
        <CyberCard3D maxWidth="max-w-md">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-xs font-mono shadow-sm shadow-cyan-500/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Terminal de Control
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-space tracking-tight text-white drop-shadow-sm">
                Acceso Administrador
              </h1>
              <p className="text-xs text-white/50 font-mono">
                Autenticación requerida para acceder al centro de mando.
              </p>
            </div>

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block">
                  Correo Administrador
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="admin@tudominio.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 text-xs font-mono focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/60 transition shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block">
                  Contraseña Maestra
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/20 text-xs font-mono focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/60 transition shadow-inner"
                  />
                </div>
              </div>

              {state.error && (
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs font-mono flex items-center gap-2 animate-shake">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>{state.error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending || isExiting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isPending ? "Autenticando..." : "Ingresar al Sistema →"}
              </button>
            </form>

            <div className="text-center pt-3 border-t border-white/5">
              <button
                onClick={handleBackToPublic}
                disabled={isExiting}
                className="text-xs font-mono text-white/40 hover:text-cyan-400 transition inline-flex items-center gap-1.5 group cursor-pointer"
              >
                <span className="transition-transform group-hover:-translate-x-1">←</span>
                <span>Volver al portafolio público</span>
              </button>
            </div>
          </div>
        </CyberCard3D>
      </div>
    </div>
  );
}
