import { NextResponse } from "next/server";
import { backendName, storeIsPersistent, db } from "@/lib/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Deploy check: which backend is live, and can it actually read and write? */
export async function GET() {
  const out: Record<string, unknown> = {
    backend: backendName,
    ai: process.env.OPENAI_API_KEY ? "openai" : "local partner",
    dataDir: backendName === "local-json" ? process.env.BC_DATA_DIR || ".data" : undefined,
  };
  try {
    const users = await db.users();
    const stories = await db.stories();
    out.ok = true;
    out.users = users.length;
    out.stories = stories.length;
  } catch (e) {
    out.ok = false;
    out.error = (e as Error).message;
    return NextResponse.json(out, { status: 503 });
  }
  // read this only after a call has touched the filesystem, or it reports optimistically
  out.persistent = backendName === "appwrite" ? true : storeIsPersistent();
  if (!out.persistent) out.note = "Filesystem is read-only. Serving in memory; member data will not survive a restart.";
  return NextResponse.json(out);
}
