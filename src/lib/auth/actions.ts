"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  AdminJWTPayload,
} from "./jwt";

export interface AuthState {
  error?: string;
  success?: boolean;
}

export interface SessionUser {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
    [key: string]: any;
  };
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: error?.message || "Credenciales inválidas." };
  }

  // Generate short-lived Access Token (15m) and long-lived Refresh Token (7d)
  const payload: AdminJWTPayload = {
    sub: data.user.id,
    email: data.user.email || email,
    role: "admin",
  };

  const accessToken = await signAccessToken(payload);
  const refreshToken = await signRefreshToken(payload);

  const cookieStore = await cookies();

  // Set HTTP-only secure JWT cookies
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);

  redirect("/");
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  // 1. Verify Access Token JWT
  if (accessToken) {
    const adminPayload = await verifyAccessToken(accessToken);
    if (adminPayload) {
      const adminUser: SessionUser = {
        id: adminPayload.sub,
        email: adminPayload.email,
        user_metadata: { full_name: "Administrador" },
      };
      return {
        user: adminUser,
        isAdmin: true,
      };
    }
  }

  // 2. If Access Token expired, attempt Refresh Token rotation
  if (refreshToken) {
    const adminPayload = await verifyRefreshToken(refreshToken);
    if (adminPayload) {
      // Re-issue a fresh Access Token
      const newAccessToken = await signAccessToken(adminPayload);
      cookieStore.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });

      const adminUser: SessionUser = {
        id: adminPayload.sub,
        email: adminPayload.email,
        user_metadata: { full_name: "Administrador" },
      };
      return {
        user: adminUser,
        isAdmin: true,
      };
    }
  }

  // 3. Fallback to Supabase Visitor session (for Google comments)
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
