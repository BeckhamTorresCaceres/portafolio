"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface AuthState {
  error?: string;
  success?: boolean;
}

export async function loginAdmin(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Correo y contraseña requeridos." };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
    return { error: "Acceso denegado: no tienes permisos de administrador." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function getCurrentSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, isAdmin: false };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = Boolean(
    adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()
  );

  return { user, isAdmin };
}
