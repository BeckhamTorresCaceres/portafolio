"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyVisitorToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  VISITOR_TOKEN_COOKIE,
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

  const adminEmail = (
    process.env.ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    "beckhamjosethtorrescaceres@gmail.com"
  ).toLowerCase();
  if (email.trim().toLowerCase() !== adminEmail) {
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
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(VISITOR_TOKEN_COOKIE);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Supabase auth not used
  }

  redirect("/");
}

export async function getCurrentSession() {
  let cookieStore;
  try {
    cookieStore = await cookies();
  } catch {
    return { user: null, isAdmin: false };
  }

  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  // 1. Verify Access Token JWT
  if (accessToken) {
    const adminPayload = await verifyAccessToken(accessToken);
    if (adminPayload) {
      const adminUser: SessionUser = {
        id: adminPayload.sub,
        email: adminPayload.email,
        user_metadata: { full_name: "Administrador", name: "Administrador" },
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
        user_metadata: { full_name: "Administrador", name: "Administrador" },
      };
      return {
        user: adminUser,
        isAdmin: true,
      };
    }
  }

  // 3. Verify Visitor JWT Token (Native Google OAuth)
  const visitorToken = cookieStore.get(VISITOR_TOKEN_COOKIE)?.value;
  if (visitorToken) {
    const visitorPayload = await verifyVisitorToken(visitorToken);
    if (visitorPayload) {
      const visitorUser: SessionUser = {
        id: visitorPayload.sub,
        email: visitorPayload.email,
        user_metadata: {
          full_name: visitorPayload.name,
          name: visitorPayload.name,
          avatar_url: visitorPayload.picture,
          picture: visitorPayload.picture,
        },
      };
      return {
        user: visitorUser,
        isAdmin: false,
      };
    }
  }

  // 4. Fallback to Supabase Visitor session (if any legacy session exists)
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const adminEmail = (
        process.env.ADMIN_EMAIL ||
        process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
        "beckhamjosethtorrescaceres@gmail.com"
      ).toLowerCase();
      const isAdmin = Boolean(user.email?.toLowerCase() === adminEmail);
      return { user, isAdmin };
    }
  } catch {
    // Ignore Supabase error
  }

  return { user: null, isAdmin: false };
}
