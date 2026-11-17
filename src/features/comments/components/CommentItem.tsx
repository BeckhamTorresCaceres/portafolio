"use client";

import { useTransition } from "react";
import { deleteComment } from "../actions";

interface CommentItemProps {
  id: string;
  userName: string;
  userAvatar?: string | null;
  content: string;
  createdAt: Date;
  canDelete: boolean;
}

export function CommentItem({
  id,
  userName,
  userAvatar,
  content,
  createdAt,
  canDelete,
}: CommentItemProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("¿Seguro que deseas eliminar este comentario?")) return;
    startTransition(async () => {
      await deleteComment(id);
    });
  };

  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));

  return (
    <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {userAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={userAvatar}
              alt={userName}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-center font-mono">
              {userName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="text-xs font-semibold text-white/90">{userName}</h4>
            <span className="text-[10px] text-white/40 font-mono">{formattedDate}</span>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-[11px] text-rose-400/70 hover:text-rose-300 font-mono transition cursor-pointer disabled:opacity-40"
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </button>
        )}
      </div>

      <p className="text-sm text-white/70 leading-relaxed pl-10 whitespace-pre-line">
        {content}
      </p>
    </div>
  );
}
