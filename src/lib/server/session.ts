import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { db, type User } from "./db";

const COOKIE = "bc_session";
const SECRET = process.env.SESSION_SECRET || "born-cinema-prototype-secret";

const sign = (payload: string) => createHmac("sha256", SECRET).update(payload).digest("base64url");
export function encodeSession(user: Pick<User, "id" | "role">) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, role: user.role, t: Date.now() })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function decodeSession(token: string | undefined): { id: string; role: User["role"] } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); } catch { return null; }
}

export async function getSession(): Promise<User | null> {
  const s = decodeSession(cookies().get(COOKIE)?.value);
  if (!s) return null;
  return db.user(s.id);
}
export const SESSION_COOKIE = COOKIE;
export const cookieOptions = { httpOnly: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 30 };
