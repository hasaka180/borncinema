import { NextResponse } from "next/server";
import { db, publicUser } from "@/lib/server/db";
import { verifyPassword } from "@/lib/server/password";
import { encodeSession, SESSION_COOKIE, cookieOptions } from "@/lib/server/session";
export const runtime = "nodejs";

/**
 * Sign in with email + password. Demo accounts (seeded, no password) can still be opened by handle
 * so the prototype stays easy to try.
 */
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  let user = null;
  if (b.email) {
    const u = await db.userByEmail(String(b.email).trim());
    if (!u || !verifyPassword(String(b.password || ""), u.passwordHash)) return NextResponse.json({ error: "bad_credentials" }, { status: 401 });
    user = u;
  } else if (b.handle) {
    const u = await db.userByHandle(String(b.handle));
    if (u && !u.passwordHash) user = u; // demo accounts only
  }
  if (!user) return NextResponse.json({ error: "unknown_account" }, { status: 400 });
  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(SESSION_COOKIE, encodeSession(user), cookieOptions);
  return res;
}
