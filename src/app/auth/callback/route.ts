import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  signAccessToken,
  signRefreshToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  AdminJWTPayload,
} from "@/lib/auth/jwt";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Si el proveedor OAuth envió un error (ej. cancelación del usuario)
  if (errorParam || errorDescription) {
    console.error("Error en callback OAuth:", errorParam, errorDescription);
    return NextResponse.redirect(
      `${origin}/?authError=${encodeURIComponent(errorDescription || errorParam || "oauth_failed")}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const adminEmail = (
        process.env.ADMIN_EMAIL ||
        process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
        "beckhamjosethtorrescaceres@gmail.com"
      ).toLowerCase();

      // Si el usuario autenticado por OAuth es el Administrador
      if (data.user.email?.toLowerCase() === adminEmail) {
        const payload: AdminJWTPayload = {
          sub: data.user.id,
          email: data.user.email,
          role: "admin",
        };

        const accessToken = await signAccessToken(payload);
        const refreshToken = await signRefreshToken(payload);
        const cookieStore = await cookies();

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

        // Redirigir al panel de administración si venía del login o raíz
        const destination = next === "/" || next === "/admin/login" ? "/admin" : next;
        return NextResponse.redirect(`${origin}${destination}`);
      }

      // Visitante normal
      return NextResponse.redirect(`${origin}${next}`);
    }

    if (error) {
      console.error("Error al intercambiar código por sesión:", error);
    }
  }

  // Fallback si no hubo código o falló
  return NextResponse.redirect(`${origin}/?authError=failed`);
}
