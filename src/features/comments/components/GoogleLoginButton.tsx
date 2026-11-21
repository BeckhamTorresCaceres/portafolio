"use client";

import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth/oauth";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle("/#comments");
    } catch (err) {
      console.error("Error al conectar con Google:", err);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-sky-400/30 bg-sky-950/40 hover:bg-sky-900/50 text-sky-200 hover:text-white transition-all text-xs font-mono font-medium shadow-sm hover:shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
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
      <span>{loading ? "Conectando..." : "Acceder con Google"}</span>
    </button>
  );
}

export default GoogleLoginButton;
