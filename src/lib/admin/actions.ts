"use server";

import { revalidatePath } from "next/cache";
import { getCurrentSession } from "@/lib/auth/actions";
import { prisma } from "@/lib/prisma";

async function assertAdmin() {
  const { isAdmin } = await getCurrentSession();
  if (!isAdmin) {
    throw new Error("Acceso denegado: solo el administrador puede realizar esta acción.");
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* =========================================================================
   PROJECTS CRUD
   ========================================================================= */

export async function createProject(formData: FormData) {
  await assertAdmin();

  const title = (formData.get("title") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() || null;
  const stackInput = (formData.get("stack") as string) || "";
  const coverImage = (formData.get("coverImage") as string)?.trim() || null;
  const demoUrl = (formData.get("demoUrl") as string)?.trim() || null;
  const repoUrl = (formData.get("repoUrl") as string)?.trim() || null;
  const order = parseInt((formData.get("order") as string) || "0", 10);
  const published = formData.get("published") === "on";

  if (!title || !description) {
    return { error: "Título y descripción son requeridos." };
  }

  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  // Parse comma-separated stack
  const stack = stackInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    await prisma.project.create({
      data: {
        title,
        slug,
        description,
        content,
        stack,
        coverImage,
        demoUrl,
        repoUrl,
        order,
        published,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error al crear proyecto:", err);
    if (err.code === "P2002") {
      return { error: `Ya existe un proyecto con el slug "${slug}". Elige otro título o slug.` };
    }
    return { error: "No se pudo guardar el proyecto." };
  }
}

export async function updateProject(id: string, formData: FormData) {
  await assertAdmin();

  const title = (formData.get("title") as string)?.trim();
  let slug = (formData.get("slug") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() || null;
  const stackInput = (formData.get("stack") as string) || "";
  const coverImage = (formData.get("coverImage") as string)?.trim() || null;
  const demoUrl = (formData.get("demoUrl") as string)?.trim() || null;
  const repoUrl = (formData.get("repoUrl") as string)?.trim() || null;
  const order = parseInt((formData.get("order") as string) || "0", 10);
  const published = formData.get("published") === "on";

  if (!title || !description) {
    return { error: "Título y descripción son requeridos." };
  }

  if (!slug) {
    slug = slugify(title);
  } else {
    slug = slugify(slug);
  }

  const stack = stackInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  try {
    await prisma.project.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        content,
        stack,
        coverImage,
        demoUrl,
        repoUrl,
        order,
        published,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err: any) {
    console.error("Error al actualizar proyecto:", err);
    return { error: "No se pudo actualizar el proyecto." };
  }
}

export async function deleteProject(id: string) {
  await assertAdmin();

  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error al eliminar proyecto:", err);
    return { error: "No se pudo eliminar el proyecto." };
  }
}

export async function toggleProjectPublished(id: string, published: boolean) {
  await assertAdmin();

  try {
    await prisma.project.update({
      where: { id },
      data: { published },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error al alternar estado publicado:", err);
    return { error: "No se pudo cambiar el estado." };
  }
}

/* =========================================================================
   SKILLS CRUD
   ========================================================================= */

export async function createSkill(formData: FormData) {
  await assertAdmin();

  const name = (formData.get("name") as string)?.trim();
  const category = (formData.get("category") as string)?.trim();
  const order = parseInt((formData.get("order") as string) || "0", 10);

  if (!name || !category) {
    return { error: "Nombre y categoría son requeridos." };
  }

  try {
    await prisma.skill.create({
      data: {
        name,
        category,
        order,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error al crear habilidad:", err);
    return { error: "No se pudo guardar la habilidad." };
  }
}

export async function deleteSkill(id: string) {
  await assertAdmin();

  try {
    await prisma.skill.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error al eliminar habilidad:", err);
    return { error: "No se pudo eliminar la habilidad." };
  }
}

/* =========================================================================
   PROFILE CRUD
   ========================================================================= */

export async function updateProfile(formData: FormData) {
  await assertAdmin();

  const name = (formData.get("name") as string)?.trim();
  const role = (formData.get("role") as string)?.trim();
  const headline = (formData.get("headline") as string)?.trim() || null;
  const description = (formData.get("description") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const githubUrl = (formData.get("githubUrl") as string)?.trim() || null;
  const linkedinUrl = (formData.get("linkedinUrl") as string)?.trim() || null;
  const twitterUrl = (formData.get("twitterUrl") as string)?.trim() || null;
  const cvUrl = (formData.get("cvUrl") as string)?.trim() || null;

  if (!name || !role || !bio || !email) {
    return { error: "Nombre, rol, bio y correo son campos obligatorios." };
  }

  try {
    const existing = await prisma.profile.findFirst();

    if (existing) {
      await prisma.profile.update({
        where: { id: existing.id },
        data: {
          name,
          role,
          headline,
          description,
          bio,
          email,
          githubUrl,
          linkedinUrl,
          twitterUrl,
          cvUrl,
        },
      });
    } else {
      await prisma.profile.create({
        data: {
          name,
          role,
          headline,
          description,
          bio,
          email,
          githubUrl,
          linkedinUrl,
          twitterUrl,
          cvUrl,
        },
      });
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error al actualizar perfil:", err);
    return { error: "No se pudo actualizar el perfil." };
  }
}

/* =========================================================================
   EXPERIENCE / TRAYECTORIA CRUD
   ========================================================================= */

export async function createExperience(formData: FormData) {
  await assertAdmin();

  const period = (formData.get("period") as string)?.trim();
  const role = (formData.get("role") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const order = parseInt((formData.get("order") as string) || "0", 10);

  if (!period || !role || !company || !description) {
    return { error: "Periodo, puesto/rol, empresa y descripción son obligatorios." };
  }

  try {
    await prisma.experience.create({
      data: {
        period,
        role,
        company,
        description,
        order,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error al crear experiencia:", err);
    return { error: "No se pudo guardar la trayectoria." };
  }
}

export async function updateExperience(id: string, formData: FormData) {
  await assertAdmin();

  const period = (formData.get("period") as string)?.trim();
  const role = (formData.get("role") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const order = parseInt((formData.get("order") as string) || "0", 10);

  if (!period || !role || !company || !description) {
    return { error: "Periodo, puesto/rol, empresa y descripción son obligatorios." };
  }

  try {
    await prisma.experience.update({
      where: { id },
      data: {
        period,
        role,
        company,
        description,
        order,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error al actualizar experiencia:", err);
    return { error: "No se pudo actualizar la trayectoria." };
  }
}

export async function deleteExperience(id: string) {
  await assertAdmin();

  try {
    await prisma.experience.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (err) {
    console.error("Error al eliminar experiencia:", err);
    return { error: "No se pudo eliminar la trayectoria." };
  }
}
