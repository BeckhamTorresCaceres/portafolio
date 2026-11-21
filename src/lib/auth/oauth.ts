export const DEFAULT_ADMIN_EMAIL = "beckhamjosethtorrescaceres@gmail.com";

export function getAdminEmail(): string {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    DEFAULT_ADMIN_EMAIL
  ).toLowerCase();
}

/**
 * Inicio de sesión nativo con Google OAuth 2.0
 * Redirige al endpoint interno /api/auth/google/login que gestiona el estado CSRF
 * y redirige al servidor oficial de autenticación de Google.
 */
export async function signInWithGoogle(next = "/") {
  if (typeof window === "undefined") return;
  window.location.href = `/api/auth/google/login?next=${encodeURIComponent(next)}`;
}

// Alias para compatibilidad
export const signInWithOAuth = (
  _provider?: "google",
  next = "/"
) => signInWithGoogle(next);
