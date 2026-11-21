import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  signAccessToken,
  signRefreshToken,
  signVisitorToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  VISITOR_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  VISITOR_TOKEN_MAX_AGE,
  AdminJWTPayload,
  VisitorJWTPayload,
} from "@/lib/auth/jwt";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const cookieStore = await cookies();
  cookieStore.delete("oauth_state");

  // Determine destination
  let next = "/";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
      if (decoded.next && typeof decoded.next === "string") {
        next = decoded.next;
      }
    } catch {
      // Keep default next
    }
  }

  // Handle errors sent by Google (e.g. user cancelled)
  if (errorParam || errorDescription) {
    console.error("Google OAuth error:", errorParam, errorDescription);
    return NextResponse.redirect(
      `${origin}/?authError=${encodeURIComponent(errorDescription || errorParam || "oauth_failed")}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/?authError=missing_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.startsWith("tu-google-client-id")) {
    console.error("Credenciales de Google OAuth no configuradas en .env");
    return NextResponse.redirect(
      `${origin}/?authError=${encodeURIComponent("Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env")}`
    );
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    // 1. Intercambio directo del código por tokens con los servidores de Google
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Error al intercambiar código con Google:", errorText);
      return NextResponse.redirect(
        `${origin}/?authError=google_token_exchange_failed`
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Obtener información del usuario autenticado desde Google Userinfo
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error("Error al obtener información de usuario desde Google");
      return NextResponse.redirect(`${origin}/?authError=google_userinfo_failed`);
    }

    const googleUser = await userResponse.json();
    const email = (googleUser.email || "").toLowerCase();
    const adminEmail = (
      process.env.ADMIN_EMAIL ||
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      "beckhamjosethtorrescaceres@gmail.com"
    ).toLowerCase();

    // 3. Caso Administrador (Beckham): emisión de Access & Refresh Token Admin
    if (email === adminEmail) {
      const adminPayload: AdminJWTPayload = {
        sub: googleUser.sub,
        email: googleUser.email,
        role: "admin",
      };

      const jwtAccessToken = await signAccessToken(adminPayload);
      const jwtRefreshToken = await signRefreshToken(adminPayload);

      cookieStore.set(ACCESS_TOKEN_COOKIE, jwtAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });

      cookieStore.set(REFRESH_TOKEN_COOKIE, jwtRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_TOKEN_MAX_AGE,
      });

      cookieStore.delete(VISITOR_TOKEN_COOKIE);

      const destination = next === "/" || next === "/admin/login" ? "/admin" : next;
      return NextResponse.redirect(`${origin}${destination}`);
    }

    // 4. Caso Visitante / Comunidad: emisión de Cookie de Sesión de Visitante
    const visitorPayload: VisitorJWTPayload = {
      sub: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name || googleUser.given_name || email.split("@")[0] || "Visitante",
      picture: googleUser.picture || undefined,
      role: "visitor",
    };

    const visitorJwt = await signVisitorToken(visitorPayload);

    cookieStore.set(VISITOR_TOKEN_COOKIE, visitorJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: VISITOR_TOKEN_MAX_AGE,
    });

    return NextResponse.redirect(`${origin}${next}`);
  } catch (err) {
    console.error("Excepción en callback de Google OAuth:", err);
    return NextResponse.redirect(`${origin}/?authError=internal_oauth_error`);
  }
}
