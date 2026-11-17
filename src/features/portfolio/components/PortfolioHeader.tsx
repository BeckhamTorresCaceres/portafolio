"use client";

import { RefObject, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "./AuthModal";
import { createClient } from "@/lib/supabase/client";

interface PortfolioHeaderProps {
  onNavigate: (id: string) => void;
  themeBtnRef: RefObject<HTMLButtonElement | null>;
  onThemeClick: () => void;
  isCrashing: boolean;
  light: boolean;
  mounted: boolean;
}

const navSections = [
  { id: "skills", label: "/skills" },
  { id: "projects", label: "/projects" },
  { id: "experience", label: "/experience" },
  { id: "comments", label: "/comments" },
  { id: "contact", label: "/contact" },
];

export function PortfolioHeader({
  onNavigate,
  themeBtnRef,
  onThemeClick,
  isCrashing,
  light,
  mounted,
}: PortfolioHeaderProps) {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<"guest" | "admin" | "visitor">("guest");

  useEffect(() => {
    const supabase = createClient();

    const verifySession = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setAuthStatus("guest");
        return;
      }

      const email = data.user.email?.toLowerCase();
      const adminEmail = (
        process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
        "beckhamjosethtorrescaceres@gmail.com"
      ).toLowerCase();

      if (email === adminEmail) {
        setAuthStatus("admin");
      } else {
        setAuthStatus("visitor");
      }
    };

    verifySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      verifySession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleDevClick = () => {
    // 1. Si es admin logueado -> Ir directamente a la vista admin sin modal
    if (authStatus === "admin") {
      router.push("/admin");
      return;
    }

    // 2. Si es cliente/visitante logueado -> Login bloqueado, ir a comentarios
    if (authStatus === "visitor") {
      onNavigate("#comments");
      return;
    }

    // 3. Si no ha iniciado sesión -> Abrir modal de login
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-12 py-5 font-mono text-sm">
        <button
          onClick={handleDevClick}
          aria-label={
            authStatus === "admin"
              ? "Ir al Centro de Mando (/admin)"
              : authStatus === "visitor"
              ? "Ver comentarios"
              : "Abrir terminal de acceso"
          }
          title={
            authStatus === "admin"
              ? "Centro de Mando (/admin) — Sesión Activa"
              : authStatus === "visitor"
              ? "Sesión de visitante activa"
              : "Acceso / Terminal"
          }
          className="hover:text-cyan-400 transition-colors cursor-pointer select-none group flex items-center gap-1.5"
        >
          <span>&lt;dev /&gt;</span>
          {authStatus === "admin" ? (
            <span
              className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              title="Admin Conectado"
            />
          ) : authStatus === "visitor" ? (
            <span
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
              title="Visitante Autenticado"
            />
          ) : (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>

        <nav className="hidden md:flex gap-8 text-fg/70">
          {navSections.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`#${id}`);
              }}
              className="hover:text-fg transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <button
          ref={themeBtnRef}
          onClick={onThemeClick}
          disabled={isCrashing}
          aria-label="Cambiar tema"
          className={`font-mono text-xs px-3 py-1.5 rounded-full border border-fg/30 text-fg/80 hover:text-fg transition-all cursor-pointer select-none ${
            isCrashing ? "scale-95 border-red-500 text-red-400" : ""
          }`}
        >
          {mounted ? (light ? "dark" : "light") : "theme"}
        </button>
      </header>

      {/* Terminal de Acceso Modal — Solo se monta y muestra si NO está logueado */}
      {authStatus === "guest" && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </>
  );
}
