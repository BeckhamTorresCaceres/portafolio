"use client";

import { useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { CommentForm } from "./CommentForm";
import { CommentItem } from "./CommentItem";
import { getComments } from "../actions";

interface CommentData {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: Date;
}

export function CommentsSection({ projectId }: { projectId?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    try {
      const data = await getComments(projectId);
      setComments(data);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    const supabase = createClient();

    // Check active session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes (login with Google, logout, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    loadComments();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadComments]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = Boolean(
    adminEmail && user?.email?.toLowerCase() === adminEmail.toLowerCase()
  );

  return (
    <section id="comments" className="relative py-16 sm:py-24 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto">
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Feedbacks & Mensajes
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-space">
          Comentarios de la Comunidad
        </h2>
        <p className="text-xs sm:text-sm text-white/50 max-w-xl leading-relaxed">
          Inicia sesión con tu cuenta de Google para dejar tus impresiones, dudas o feedback sobre los proyectos y el portafolio.
        </p>
      </div>

      {/* Auth State & Form Container */}
      <div className="p-4 sm:p-6 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl mb-8 sm:mb-10 shadow-2xl">
        {user ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                    alt={user.user_metadata?.full_name || "Usuario"}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-cyan-400/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cyan-900 text-cyan-200 text-xs flex items-center justify-center font-bold">
                    {(user.email?.[0] || "U").toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-white">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-[10px] text-cyan-400/80 font-mono">
                    {isAdmin ? "Administrador" : "Visitante autenticado"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs font-mono text-white/50 hover:text-white transition cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>

            <CommentForm projectId={projectId} />
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <p className="text-sm text-white/60">
              ¿Quieres dejar tu opinión? Solo te tomará un clic.
            </p>
            <div className="flex justify-center">
              <GoogleLoginButton />
            </div>
          </div>
        )}
      </div>

      {/* List of Comments */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-3">
          Comentarios publicados ({comments.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-sm font-mono text-white/30">
            Cargando comentarios...
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-sm text-white/40 font-mono">
            Aún no hay comentarios. ¡Sé el primero en compartir algo!
          </div>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              id={c.id}
              userName={c.userName}
              userAvatar={c.userAvatar}
              content={c.content}
              createdAt={c.createdAt}
              canDelete={isAdmin || (user !== null && user.id === c.userId)}
            />
          ))
        )}
      </div>
    </section>
  );
}
