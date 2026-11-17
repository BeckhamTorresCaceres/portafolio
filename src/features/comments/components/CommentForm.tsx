"use client";

import { useActionState, useEffect, useRef } from "react";
import { createComment, CommentActionState } from "../actions";

const initialState: CommentActionState = {};

export function CommentForm({ projectId }: { projectId?: string }) {
  const [state, formAction, isPending] = useActionState(createComment, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {projectId && <input type="hidden" name="projectId" value={projectId} />}

      <div>
        <textarea
          name="content"
          rows={3}
          maxLength={600}
          required
          placeholder="Deja un comentario o feedback sobre el portafolio..."
          className="w-full px-4 py-3 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition resize-none"
        />
      </div>

      {state.error && (
        <p className="text-xs text-rose-400 font-mono">{state.error}</p>
      )}

      {state.success && (
        <p className="text-xs text-emerald-400 font-mono">¡Comentario publicado con éxito!</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-xs font-mono tracking-wider uppercase rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition disabled:opacity-50 cursor-pointer"
        >
          {isPending ? "Publicando..." : "Publicar comentario"}
        </button>
      </div>
    </form>
  );
}
