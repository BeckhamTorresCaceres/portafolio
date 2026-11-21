import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  // Redirigir de manera transparente al callback nativo de Google OAuth
  const targetUrl = new URL(`${origin}/api/auth/google/callback`);
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });
  return NextResponse.redirect(targetUrl.toString());
}
