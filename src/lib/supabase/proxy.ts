import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
} from "@/lib/auth/jwt";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 1. JWT Access & Refresh Token Validation for Admin
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  let isAdminAuthenticated = false;

  if (accessToken) {
    const adminPayload = await verifyAccessToken(accessToken);
    if (adminPayload) {
      isAdminAuthenticated = true;
    }
  }

  // If Access Token expired, verify Refresh Token and rotate Access Token
  if (!isAdminAuthenticated && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (refreshPayload) {
      isAdminAuthenticated = true;
      const newAccessToken = await signAccessToken(refreshPayload);

      // Set fresh access token cookie in request and response
      request.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken);
      supabaseResponse.cookies.set(ACCESS_TOKEN_COOKIE, newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
    }
  }

  // 2. Refresh Supabase auth session (for visitors with Google OAuth)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const adminEmail = process.env.ADMIN_EMAIL;

  // Fallback: If user is authenticated via Supabase as admin
  if (!isAdminAuthenticated && user && adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()) {
    isAdminAuthenticated = true;
  }

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!isAdminAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Block /admin/login when already authenticated
  if (pathname === "/admin/login") {
    if (isAdminAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
    if (user) {
      // Client/visitor is already logged in -> block login, redirect to home
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
