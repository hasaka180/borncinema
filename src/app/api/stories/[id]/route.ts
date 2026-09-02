import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guard(id: string) {
  const me = await getSession(); if (!me) return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  const story = await db.story(id); if (!story) return { error: NextResponse.json({ error: "not_found" }, { status: 404 }) };
  if (story.authorId !== me.id && me.role !== "superadmin") return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  return { me, story };
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id); if ("error" in g) return g.error;
  return NextResponse.json({ story: g.story });
}

/** Edit fields, or move the story through its life: submit · withdraw · unpublish. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id); if ("error" in g) return g.error;
  const b = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  for (const k of ["title", "hook", "synopsis", "cover", "genre", "format", "language", "rating", "visibility", "allowRemixes", "tags", "paragraphs"] as const) if (k in b) patch[k] = b[k];
  const now = new Date().toISOString();
  if (b.action === "submit") { patch.status = g.story.visibility === "public" && b.visibility !== "unlisted" && b.visibility !== "private" ? "submitted" : "published"; patch.submittedAt = now; if (patch.status === "published") patch.publishedAt = now; patch.review = undefined; }
  if (b.action === "withdraw" || b.action === "unpublish") { patch.status = "draft"; }
  const story = await db.updateStory(params.id, patch);
  return NextResponse.json({ story });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const g = await guard(params.id); if ("error" in g) return g.error;
  await db.deleteStory(params.id);
  return NextResponse.json({ ok: true });
}
