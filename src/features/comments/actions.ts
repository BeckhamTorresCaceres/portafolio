"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/auth/actions";
import { prisma } from "@/lib/prisma";

export interface CommentActionState {
  error?: string;
  success?: boolean;
}

export async function createComment(
  _prevState: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const { user } = await getCurrentSession();

  if (!user) {
    return { error: "Debes iniciar sesión con Google para comentar." };
  }

  const content = (formData.get("content") as string)?.trim();
  const projectId = (formData.get("projectId") as string) || null;

  if (!content) {
    return { error: "El comentario no puede estar vacío." };
  }

  if (content.length > 600) {
    return { error: "El comentario supera el límite de 600 caracteres." };
  }

  try {
    const userName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Invitado";
    const userAvatar =
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    await prisma.comment.create({
      data: {
        userId: user.id,
        userName,
        userAvatar,
        content,
        projectId,
        status: "visible",
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Error creating comment:", err);
    return { error: "No se pudo guardar el comentario en la base de datos." };
  }
}

export async function deleteComment(commentId: string) {
  const { user, isAdmin } = await getCurrentSession();

  if (!user) {
    throw new Error("No autenticado");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comentario no encontrado");
  }

  // Only comment author or admin can delete
  if (comment.userId !== user.id && !isAdmin) {
    throw new Error("No tienes permisos para eliminar este comentario");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath("/");
  return { success: true };
}

export async function getComments(projectId?: string) {
  try {
    return await prisma.comment.findMany({
      where: {
        status: "visible",
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err: any) {
    console.warn(
      "⚠️ [Prisma] Base de datos no conectada aún. Revisa las credenciales en .env:",
      err?.message?.split("\n")?.[0] || err
    );
    return [];
  }
}

export async function toggleCommentStatus(commentId: string, newStatus: "visible" | "hidden") {
  const { isAdmin } = await getCurrentSession();

  if (!isAdmin) {
    throw new Error("Acción reservada exclusivamente para el administrador.");
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { status: newStatus },
  });

  revalidatePath("/");
  return { success: true };
}
