import { getCurrentSession, logout } from "@/lib/auth/actions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { toggleCommentStatus, deleteComment } from "@/features/comments/actions";
import { AdminTabs } from "@/features/admin/components/AdminTabs";

export const instant = false;

export default async function AdminDashboardPage() {
  const { user, isAdmin } = await getCurrentSession();

  if (!user || !isAdmin) {
    redirect("/admin/login");
  }

  // Safe concurrent data fetch from Supabase
  let projects: any[] = [];
  let skills: any[] = [];
  let experiences: any[] = [];
  let profile: any | null = null;
  let comments: any[] = [];

  try {
    [projects, skills, experiences, profile, comments] = await Promise.all([
      prisma.project.findMany({
        orderBy: { order: "asc" },
      }),
      prisma.skill.findMany({
        orderBy: { order: "asc" },
      }),
      prisma.experience.findMany({
        orderBy: { order: "asc" },
      }),
      prisma.profile.findFirst(),
      prisma.comment.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);
  } catch (err) {
    console.warn("⚠️ Aviso al cargar datos de administración:", err);
  }

  // Server actions for comment moderation
  async function handleToggleComment(id: string, newStatus: "visible" | "hidden") {
    "use server";
    return await toggleCommentStatus(id, newStatus);
  }

  async function handleDeleteComment(id: string) {
    "use server";
    return await deleteComment(id);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono transition"
          >
            Ver vista pública ↗
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 text-xs font-mono transition cursor-pointer"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
          <span className="text-[11px] font-mono uppercase text-white/40 block">Proyectos</span>
          <p className="text-3xl font-bold font-mono text-cyan-400 mt-1">{projects.length}</p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
          <span className="text-[11px] font-mono uppercase text-white/40 block">Habilidades</span>
          <p className="text-3xl font-bold font-mono text-emerald-400 mt-1">{skills.length}</p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
          <span className="text-[11px] font-mono uppercase text-white/40 block">Comentarios</span>
          <p className="text-3xl font-bold font-mono text-indigo-400 mt-1">{comments.length}</p>
        </div>
        <div className="p-5 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur">
          <span className="text-[11px] font-mono uppercase text-white/40 block">Perfil DB</span>
          <p className="text-sm font-bold font-mono text-white/90 mt-2 truncate">
            {profile?.name || "Sin configurar"}
          </p>
        </div>
      </div>

      {/* Interactive Tabs CRUD Manager */}
      <AdminTabs
        projects={projects}
        skills={skills}
        experiences={experiences}
        profile={profile}
        comments={comments}
        toggleCommentAction={handleToggleComment}
        deleteCommentAction={handleDeleteComment}
      />
    </div>
  );
}
