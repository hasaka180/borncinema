import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";
import { db, publicUser } from "@/lib/server/db";
import { hashPassword, verifyPassword } from "@/lib/server/password";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() { const me = await getSession(); return NextResponse.json({ user: me ? publicUser(me) : null }); }

/** Edit your creative profile, or change your password. */
export async function PATCH(req: Request) {
  const me = await getSession(); if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (typeof b.name === "string" && b.name.trim().length >= 2) patch.name = b.name.trim().slice(0, 60);
  if (typeof b.bio === "string") patch.bio = b.bio.slice(0, 280);
  if (typeof b.location === "string") patch.location = b.location.slice(0, 60);
  if (Array.isArray(b.makes)) patch.makes = b.makes.map(String).slice(0, 8);
  if (Array.isArray(b.genres)) patch.genres = b.genres.map(String).slice(0, 8);
  if (b.newPassword) {
    if (me.passwordHash && !verifyPassword(String(b.currentPassword || ""), me.passwordHash)) return NextResponse.json({ errors: { currentPassword: "Current password is wrong." } }, { status: 400 });
    if (String(b.newPassword).length < 8) return NextResponse.json({ errors: { newPassword: "Use at least 8 characters." } }, { status: 400 });
    patch.passwordHash = hashPassword(String(b.newPassword));
  }
  const user = await db.updateUser(me.id, patch);
  return NextResponse.json({ user: user ? publicUser(user) : null });
}
