import { createClient } from "@/lib/supabase/client";

export const DEFAULT_ADMIN_EMAIL = "beckhamjosethtorrescaceres@gmail.com";

export function getAdminEmail(): string {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    DEFAULT_ADMIN_EMAIL
  ).toLowerCase();
}

export async function signInWithGoogle(next = "/") {
  if (typeof window === "undefined") return;

  const supabase = createClient();
  const origin = window.location.origin;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.error("Error al iniciar sesión con Google:", error);
    throw error;
  }

  return data;
}

// Alias for compatibility
export const signInWithOAuth = (
  _provider?: "google",
  next = "/"
) => signInWithGoogle(next);
