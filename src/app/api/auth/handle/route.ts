import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** GET ?h=handle -> { available } */
export async function GET(req: Request) {
  const h = new URL(req.url).searchParams.get("h") || "";
  if (!/^[a-z0-9][a-z0-9-]{2,23}$/.test(h)) return NextResponse.json({ available: false, reason: "format" });
  return NextResponse.json({ available: await db.handleAvailable(h) });
}
