import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getSession(); if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const stories = me.role === "superadmin" ? await db.stories() : await db.stories({ authorId: me.id });
  return NextResponse.json({ stories });
}

/** Create a story from the studio. Public stories go to the editorial desk; unlisted/private publish immediately. */
export async function POST(req: Request) {
  const me = await getSession(); if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b || !b.title || !Array.isArray(b.paragraphs) || b.paragraphs.length === 0) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const action: "draft" | "submit" = b.action === "draft" ? "draft" : "submit";
  const visibility = ["public", "unlisted", "private"].includes(b.visibility) ? b.visibility : "public";
  const now = new Date().toISOString();
  const status = action === "draft" ? "draft" : visibility === "public" ? "submitted" : "published";
  const doc = await db.createStory({
    title: String(b.title).slice(0, 120), authorId: me.id, authorName: me.name, authorHandle: me.handle,
    cover: String(b.cover || ""), hook: String(b.hook || ""), synopsis: String(b.synopsis || ""), genre: String(b.genre || "Drama"), format: String(b.format || "Short Story"),
    tags: Array.isArray(b.tags) ? b.tags.map(String).slice(0, 12) : [], language: String(b.language || "English"), rating: String(b.rating || "Everyone"),
    visibility, allowRemixes: !!b.allowRemixes, paragraphs: b.paragraphs.map(String), status,
    submittedAt: status === "submitted" ? now : undefined, publishedAt: status === "published" ? now : undefined, project: b.project,
  });
  return NextResponse.json({ story: doc }, { status: 201 });
}
