"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { loginAdmin, AuthState } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { CyberCard3D } from "@/features/auth/components/CyberCard3D";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialState: AuthState = {};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [state, formAction, isPending] = useActionState(loginAdmin, initialState);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isAdminSession, setIsAdminSession] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const email = data?.user?.email?.toLowerCase();
      if (email && email === "beckhamjosethtorrescaceres@gmail.com") {
        setIsAdminSession(true);
      }
    });
  }, [isOpen]);

  // Entrance animation
  useEffect(() => {
    if (isOpen && modalRef.current && backdropRef.current) {
      setIsClosing(false);
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        modalRef.current,
        {
          opacity: 0,
          scale: 0.85,
          rotationX: 20,
          y: -25,
        },
        {
          opacity: 1,
          scale: 1,
          rotationX: 0,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
        }
      );
    }
  }, [isOpen]);

  // Graceful 3D Exit Animation
  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);

    if (modalRef.current && backdropRef.current) {
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.8,
        rotationX: -22,
        y: 45,
        duration: 0.32,
        ease: "power3.in",
      });

      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          setIsClosing(false);
          onClose();
        },
      });
    } else {
      onClose();
    }
  };

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClosing]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (err) {
      console.error("Error al iniciar con Google:", err);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Dynamic blurred backdrop */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* Cyber 3D Tilting Modal Card with 3D Exit/Enter Transitions */}
      <div
        ref={modalRef}
        style={{ perspective: "1000px" }}
        className="relative z-10 w-full max-w-md select-none"
      >
        <CyberCard3D maxWidth="max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
                Terminal de Acceso
              </span>
            </div>

            <button
              onClick={handleClose}
              aria-label="Cerrar modal"
              className="text-white/40 hover:text-white transition font-mono text-sm px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Active Admin Session Quick Jump */}
          {isAdminSession && (
            <div className="p-3.5 my-3 rounded-xl border border-cyan-400/40 bg-cyan-950/40 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-cyan-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Sesión activa como Administrador</span>
              </div>
              <a
                href="/admin"
                className="block w-full py-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase font-mono tracking-wider transition"
              >
                Ir al Centro de Mando (/admin) →
              </a>
            </div>
          )}

          {/* Admin Section */}
          <div className="space-y-4 my-4">
            <div>
              <h3 className="text-lg font-bold text-white font-space">Acceso Administrador</h3>
              <p className="text-xs text-white/50 font-mono mt-0.5">
                Ingresa credenciales para acceder al centro de mando.
              </p>
            </div>

            <form action={formAction} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                  Correo
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@tudominio.com"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/60 font-mono transition"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/60 font-mono transition"
                />
              </div>

              {state.error && (
                <p className="text-xs text-rose-400 font-mono bg-rose-950/40 border border-rose-500/30 p-2 rounded-lg">
                  {state.error}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isPending ? "Validando credenciales..." : "Ingresar como Admin →"}
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-slate-950 px-3 text-[10px] font-mono text-white/40 uppercase tracking-widest absolute">
              o para visitantes
            </span>
          </div>

          {/* Visitor / Google Section */}
          <div className="space-y-2 text-center">
            <p className="text-xs text-white/50">
              ¿Deseas interactuar o dejar comentarios?
            </p>
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition text-xs font-medium cursor-pointer disabled:opacity-50 hover:border-white/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{googleLoading ? "Conectando..." : "Acceder con Google"}</span>
            </button>
          </div>
        </CyberCard3D>
      </div>
    </div>
  );
}
