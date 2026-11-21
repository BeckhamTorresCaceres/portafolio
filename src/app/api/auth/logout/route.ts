import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  VISITOR_TOKEN_COOKIE,
} from "@/lib/auth/jwt";

export async function POST(_request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(VISITOR_TOKEN_COOKIE);

  return NextResponse.json({ success: true });
}
