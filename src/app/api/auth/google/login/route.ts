import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId || clientId.startsWith("tu-google-client-id")) {
    console.error("GOOGLE_CLIENT_ID no configurado en .env");
    return NextResponse.redirect(
      `${origin}/?authError=${encodeURIComponent("Configura GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env")}`
    );
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  // Cryptographic state to prevent CSRF attacks
  const statePayload = {
    nonce: crypto.randomUUID(),
    next,
    t: Date.now(),
  };
  const stateEncoded = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  const cookieStore = await cookies();
  cookieStore.set("oauth_state", stateEncoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("access_type", "offline");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", stateEncoded);

  return NextResponse.redirect(googleAuthUrl.toString());
}
