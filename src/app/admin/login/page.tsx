"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { loginAdmin, AuthState } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle, getAdminEmail } from "@/lib/auth/oauth";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // If already authenticated, completely block the login view and redirect
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const email = data.user.email?.toLowerCase();
        const adminEmail = getAdminEmail();

        if (email === adminEmail) {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      }
    });
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await signInWithGoogle("/admin");
    } catch (err) {
      console.error("Error al iniciar con Google:", err);
      setGoogleLoading(false);
    }
  };

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
                disabled={isPending || isExiting || googleLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold font-mono text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isPending ? "Autenticando..." : "Ingresar con Contraseña →"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#07080c] px-3 text-[10px] font-mono text-white/40 uppercase tracking-widest absolute">
                o acceso rápido
              </span>
            </div>

            {/* 1-Click Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || isPending || isExiting}
              className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition text-xs font-mono font-medium cursor-pointer disabled:opacity-50 hover:border-white/20 shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.7 1 4 3.5 2.2 7.1l3.7 2.8C6.8 6.9 9.2 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h6c-.3 1.4-1 2.5-2.2 3.3l3.6 2.8c2.1-1.9 3.2-4.7 3.2-8.1z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.9 14.1c-.2-.7-.3-1.4-.3-2.1s.1-1.4.3-2.1L2.2 7.1C1.4 8.6 1 10.3 1 12s.4 3.4 1.2 4.9l3.7-2.8z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.8 0-5.2-1.9-6.1-4.5L2.2 16.9C4 20.5 7.7 23 12 23z"
                />
              </svg>
              <span>{googleLoading ? "Conectando con Google..." : "Acceder con Google"}</span>
            </button>

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
