import { NextResponse } from "next/server";
import { db, publicUser } from "@/lib/server/db";
import { hashPassword } from "@/lib/server/password";
import { encodeSession, SESSION_COOKIE, cookieOptions } from "@/lib/server/session";
export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HANDLE = /^[a-z0-9][a-z0-9-]{2,23}$/;

/** Become a creator. Validates, hashes the password, opens a session. */
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name || "").trim();
  const email = String(b.email || "").trim().toLowerCase();
  const password = String(b.password || "");
  const handle = String(b.handle || "").trim().toLowerCase();
  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Tell us your name.";
  if (!EMAIL.test(email)) errors.email = "That email doesn't look right.";
  if (password.length < 8) errors.password = "Use at least 8 characters.";
  if (handle && !HANDLE.test(handle)) errors.handle = "Handles are 3–24 characters: letters, numbers, dashes.";
  if (!errors.email && (await db.userByEmail(email))) errors.email = "An account already uses this email.";
  if (!errors.handle && handle && !(await db.handleAvailable(handle))) errors.handle = "That handle is taken.";
  if (!b.agree) errors.agree = "Please agree to the community guidelines.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  const user = await db.createUser({
    name, email, passwordHash: hashPassword(password), handle: handle || undefined, role: "creator",
    bio: String(b.bio || "").slice(0, 280) || undefined,
    makes: Array.isArray(b.makes) ? b.makes.map(String).slice(0, 8) : undefined,
    genres: Array.isArray(b.genres) ? b.genres.map(String).slice(0, 8) : undefined,
    location: String(b.location || "").slice(0, 60) || undefined,
  });
  const res = NextResponse.json({ user: publicUser(user) }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, encodeSession(user), cookieOptions);
  return res;
}
