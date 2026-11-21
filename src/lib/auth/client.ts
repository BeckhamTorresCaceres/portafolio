import { SessionUser } from "./actions";

export interface ClientSession {
  user: SessionUser | null;
  isAdmin: boolean;
}

/**
 * Obtener la sesión actual desde el cliente sin depender de SDKs externos
 */
export async function getClientSession(): Promise<ClientSession> {
  try {
    const res = await fetch("/api/auth/session", {
      cache: "no-store",
    });
    if (!res.ok) return { user: null, isAdmin: false };
    return await res.json();
  } catch {
    return { user: null, isAdmin: false };
  }
}

/**
 * Cerrar sesión en el cliente y recargar la vista
 */
export async function clientLogout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } finally {
    window.location.reload();
  }
}
