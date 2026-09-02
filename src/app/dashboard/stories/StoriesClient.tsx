"use client";
import Link from "next/link";
import { useState } from "react";
import type { StoryDoc } from "@/lib/server/db";
import { Still } from "@/components/ui/Still";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { IMG } from "@/lib/data";
import { cn, timeAgo } from "@/lib/utils";

export function StoriesClient({ initial, admin }: { initial: StoryDoc[]; admin: boolean }) {
  const [list, setList] = useState(initial);
  const [filter, setFilter] = useState<"all" | StoryDoc["status"]>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const act = async (id: string, action: string) => {
    setBusy(id);
    if (action === "delete") { if (!confirm("Delete this story? This cannot be undone.")) { setBusy(null); return; } await fetch(`/api/stories/${id}`, { method: "DELETE" }); setList((l) => l.filter((s) => s.id !== id)); }
    else { const r = await fetch(`/api/stories/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }); const d = await r.json(); if (d.story) setList((l) => l.map((s) => (s.id === id ? d.story : s))); }
    setBusy(null);
  };
  const shown = list.filter((s) => filter === "all" || s.status === filter);
  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div><div className="label text-accent mb-3">{admin ? "All stories" : "My stories"}</div><h1 className="display text-xl md:text-3xl text-ink">{list.length} {list.length === 1 ? "story" : "stories"}</h1></div>
        <Link href="/dashboard/new" className="btn btn-primary btn-sm">New story</Link>
      </div>
      <div className="mt-8 flex gap-2 flex-wrap">{(["all", "draft", "submitted", "published", "rejected"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={cn("chip", filter === f && "active")}>{f === "submitted" ? "in review" : f}</button>)}</div>
      {shown.length === 0 && <div className="card-edit p-10 mt-8 text-center"><p className="serif italic text-ink-2">Nothing here yet.</p></div>}
      <div className="mt-6 grid md:grid-cols-2 gap-5">
        {shown.map((s) => (
          <div key={s.id} className={cn("card-edit p-5 flex gap-5", busy === s.id && "animate-pulse")}>
            <Still src={s.cover || IMG.tunnel} alt="" className="h-28 w-20 shrink-0 !rounded-xl" />
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between gap-3"><Link href={`/dashboard/stories/${s.id}`} className="display text-xl text-ink hover:text-accent transition-colors leading-tight">{s.title}</Link><StatusPill status={s.status} /></div>
              <p className="serif italic text-ink-2 text-sm mt-2 line-clamp-2">{s.hook}</p>
              <div className="label-sm text-ink-3 mt-2">{admin ? `${s.authorName} · ` : ""}{s.format} · {s.genre} · {s.visibility} · {timeAgo(s.updatedAt)}</div>
              {s.review && <p className="text-xs text-ink-2 mt-2 rounded-cine-sm px-3 py-2" style={{ background: "var(--bg-2)" }}>Editorial note: {s.review.note || (s.review.decision === "approve" ? "Approved." : "Needs changes.")}</p>}
              <div className="flex flex-wrap gap-4 mt-auto pt-4 label-sm">
                <Link href={`/dashboard/stories/${s.id}`} className="text-ink-2 hover:text-ink">Edit</Link>
                {s.status === "published" && <Link href={`/story/${s.slug}`} className="text-accent">View live</Link>}
                {(s.status === "draft" || s.status === "rejected") && <button onClick={() => act(s.id, "submit")} className="text-accent">{s.visibility === "public" ? "Submit for review" : "Publish"}</button>}
                {s.status === "submitted" && <button onClick={() => act(s.id, "withdraw")} className="text-ink-2 hover:text-ink">Withdraw</button>}
                {s.status === "published" && <button onClick={() => act(s.id, "unpublish")} className="text-ink-2 hover:text-ink">Unpublish</button>}
                <button onClick={() => act(s.id, "delete")} className="text-ink-3 hover:text-accent ml-auto">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
