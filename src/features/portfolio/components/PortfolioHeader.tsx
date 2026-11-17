"use client";

import { RefObject, useState } from "react";
import { AuthModal } from "./AuthModal";

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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-12 py-5 font-mono text-sm">
        <button
          onClick={() => setIsAuthModalOpen(true)}
          aria-label="Abrir terminal de acceso"
          title="Acceso / Terminal"
          className="hover:text-cyan-400 transition-colors cursor-pointer select-none group flex items-center gap-1.5"
        >
          <span>&lt;dev /&gt;</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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

      {/* Terminal de Acceso Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
