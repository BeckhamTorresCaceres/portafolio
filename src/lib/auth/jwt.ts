import { SignJWT, jwtVerify } from "jose";

export interface AdminJWTPayload {
  sub: string;
  email: string;
  role: "admin";
}

export interface VisitorJWTPayload {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  role: "visitor";
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

// Cookies names
export const ACCESS_TOKEN_COOKIE = "admin_access_token";
export const REFRESH_TOKEN_COOKIE = "admin_refresh_token";
export const VISITOR_TOKEN_COOKIE = "visitor_auth_token";

// Durations
export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days
export const VISITOR_TOKEN_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Sign short-lived Access Token (15 minutes) for Admin
 */
export async function signAccessToken(payload: AdminJWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);
}

/**
 * Sign long-lived Refresh Token (7 days) for Admin
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

/**
 * Sign 30-day Session Token for Visitor (Native Google OAuth)
 */
export async function signVisitorToken(payload: VisitorJWTPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(ACCESS_SECRET);
}

/**
 * Verify Visitor Session Token
 */
export async function verifyVisitorToken(
  token: string
): Promise<VisitorJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    if (payload.role !== "visitor") return null;
    return payload as unknown as VisitorJWTPayload;
  } catch {
    return null;
  }
}
