"use client";

import { RefObject, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "./AuthModal";
import { getClientSession } from "@/lib/auth/client";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<"guest" | "admin" | "visitor">("guest");

  useEffect(() => {
    const verifySession = async () => {
      const session = await getClientSession();
      if (!session.user) {
        setAuthStatus("guest");
        return;
      }

      if (session.isAdmin) {
        setAuthStatus("admin");
      } else {
        setAuthStatus("visitor");
      }
    };

    verifySession();
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

        <div className="flex items-center gap-2">
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

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Navegación móvil"
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-full border border-fg/20 hover:border-fg/50 text-fg transition cursor-pointer text-xs"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>

      {/* Menú desplegable móvil */}
      {isMobileMenuOpen && (
        <>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-35 bg-black/60 backdrop-blur-sm md:hidden"
          />
          <div className="fixed inset-x-4 top-20 z-40 md:hidden glass rounded-2xl p-4 border border-fg/20 shadow-2xl space-y-2">
            <div className="text-[10px] font-mono tracking-widest text-fg/40 uppercase pb-2 border-b border-fg/10">
              SISTEMA // NAVEGACIÓN
            </div>
            <div className="flex flex-col gap-1">
              {navSections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMobileMenuOpen(false);
                    onNavigate(`#${id}`);
                  }}
                  className="text-xs font-mono text-fg/80 hover:text-accent py-2.5 px-3 rounded-lg hover:bg-fg/5 transition flex items-center justify-between"
                >
                  <span>{label}</span>
                  <span className="text-[10px] text-fg/30">↗</span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}

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
