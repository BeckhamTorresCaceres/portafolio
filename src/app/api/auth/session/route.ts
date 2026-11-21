import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/actions";

export async function GET(_request: Request) {
  try {
    const session = await getCurrentSession();
    return NextResponse.json(session);
  } catch (err) {
    console.error("Error retrieving session:", err);
    return NextResponse.json({ user: null, isAdmin: false }, { status: 500 });
  }
}
