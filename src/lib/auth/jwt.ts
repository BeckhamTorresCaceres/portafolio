import { SignJWT, jwtVerify } from "jose";

export interface AdminJWTPayload {
  sub: string;
  email: string;
  role: "admin";
}

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "portafolio-super-secret-jwt-access-token-key-2026"
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET ||
    "portafolio-super-secret-jwt-refresh-token-key-2026"
);

export const ACCESS_TOKEN_COOKIE = "admin_access_token";
export const REFRESH_TOKEN_COOKIE = "admin_refresh_token";

// Durations
export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

/**
 * Sign short-lived Access Token (15 minutes)
 */
export async function signAccessToken(payload: AdminJWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);
}

/**
 * Sign long-lived Refresh Token (7 days)
 */
export async function signRefreshToken(payload: AdminJWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);
}

/**
 * Verify Access Token
 */
export async function verifyAccessToken(
  token: string
): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    if (payload.role !== "admin") return null;
    return payload as unknown as AdminJWTPayload;
  } catch {
    return null;
  }
}

/**
 * Verify Refresh Token
 */
export async function verifyRefreshToken(
  token: string
): Promise<AdminJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    if (payload.role !== "admin") return null;
    return payload as unknown as AdminJWTPayload;
  } catch {
    return null;
  }
}
