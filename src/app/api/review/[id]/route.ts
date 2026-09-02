import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Superadmin only: approve (publish), reject with a note, or toggle featured. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const me = await getSession();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (me.role !== "superadmin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const b = await req.json().catch(() => ({}));
  const story = await db.story(params.id); if (!story) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const now = new Date().toISOString();
  if (b.decision === "approve") return NextResponse.json({ story: await db.updateStory(params.id, { status: "published", publishedAt: now, featured: !!b.featured, review: { by: me.name, at: now, note: String(b.note || ""), decision: "approve" } }) });
  if (b.decision === "reject") return NextResponse.json({ story: await db.updateStory(params.id, { status: "rejected", review: { by: me.name, at: now, note: String(b.note || ""), decision: "reject" } }) });
  if (b.decision === "feature") return NextResponse.json({ story: await db.updateStory(params.id, { featured: !story.featured }) });
  if (b.decision === "unpublish") return NextResponse.json({ story: await db.updateStory(params.id, { status: "draft", review: { by: me.name, at: now, note: String(b.note || "Unpublished by the editorial desk."), decision: "reject" } }) });
  return NextResponse.json({ error: "invalid" }, { status: 400 });
}
