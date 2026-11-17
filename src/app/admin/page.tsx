import { getCurrentSession, logout } from "@/lib/auth/actions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { toggleCommentStatus, deleteComment } from "@/features/comments/actions";

export const instant = false;

export default async function AdminDashboardPage() {
  const { user, isAdmin } = await getCurrentSession();

  if (!user || !isAdmin) {
    redirect("/admin/login");
  }

  // Fetch metrics & comments safely
  let projectsCount = 0;
  let commentsCount = 0;
  let allComments: any[] = [];

  try {
    [projectsCount, commentsCount, allComments] = await Promise.all([
      prisma.project.count(),
      prisma.comment.count(),
      prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);
  } catch (err) {
    console.error("Prisma error loading admin metrics:", err);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Panel Administrativo Activo
            </span>
          </div>
          <h1 className="text-3xl font-bold font-space">Centro de Mando</h1>
          <p className="text-xs text-white/50 font-mono mt-1">
            Conectado como: <span className="text-white">{user.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono transition"
          >
            Ver vista pública ↗
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-mono transition cursor-pointer"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
        <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
          <span className="text-xs font-mono uppercase text-white/40">Proyectos Registrados</span>
          <p className="text-4xl font-bold font-mono text-cyan-400 mt-2">{projectsCount}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
          <span className="text-xs font-mono uppercase text-white/40">Total Comentarios</span>
          <p className="text-4xl font-bold font-mono text-indigo-400 mt-2">{commentsCount}</p>
        </div>
        <div className="p-6 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
          <span className="text-xs font-mono uppercase text-white/40">Modo de Base de Datos</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-2">Prisma + Supabase</p>
        </div>
      </div>

      {/* Comments Moderation Table */}
      <section className="space-y-4 mt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-space">Moderación de Comentarios</h2>
            <p className="text-xs text-white/50">
              Revisa, oculta o elimina los comentarios publicados por los visitantes invitados.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900/30 overflow-hidden">
          {allComments.length === 0 ? (
            <div className="p-12 text-center text-sm font-mono text-white/30">
              No hay comentarios para moderar en este momento.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {allComments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white">
                        {comment.userName}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          comment.status === "visible"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {comment.status}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <form
                      action={async () => {
                        "use server";
                        await toggleCommentStatus(
                          comment.id,
                          comment.status === "visible" ? "hidden" : "visible"
                        );
                      }}
                    >
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-md border border-white/10 hover:border-white/30 text-xs font-mono text-white/70 hover:text-white transition cursor-pointer"
                      >
                        {comment.status === "visible" ? "Ocultar" : "Mostrar"}
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await deleteComment(comment.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-md border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-xs font-mono text-rose-300 transition cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
