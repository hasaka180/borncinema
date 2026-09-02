"use client";
import Link from "next/link";
import { useState } from "react";
import type { StoryDoc } from "@/lib/server/db";
import { Still } from "@/components/ui/Still";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { IMG } from "@/lib/data";
import { cn, timeAgo } from "@/lib/utils";

export function ReviewClient({ initial, open }: { initial: StoryDoc[]; open?: string }) {
  const [list, setList] = useState(initial);
  const [tab, setTab] = useState<"submitted" | "published" | "rejected" | "all">("submitted");
  const [sel, setSel] = useState<string | null>(open || null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const shown = list.filter((s) => tab === "all" || s.status === tab);
  const cur = list.find((s) => s.id === sel) || null;

  const decide = async (decision: string, featured = false) => {
    if (!cur) return; setBusy(true);
    const r = await fetch(`/api/review/${cur.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision, note, featured }) });
    const d = await r.json(); if (d.story) setList((l) => l.map((s) => (s.id === cur.id ? d.story : s)));
    setNote(""); setBusy(false);
  };

  return (
    <div className="max-w-7xl">
      <div className="label text-accent mb-3">Editorial desk</div>
      <h1 className="display text-xl md:text-3xl text-ink">Review queue</h1>
      <p className="serif italic text-ink-2 mt-3">Every public story is read here before it exists for readers. Approve, ask for changes, or feature.</p>
      <div className="mt-8 flex gap-2 flex-wrap">{(["submitted", "published", "rejected", "all"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("chip", tab === t && "active")}>{t === "submitted" ? "waiting" : t} <span className="opacity-60">{list.filter((s) => t === "all" || s.status === t).length}</span></button>)}</div>

      <div className="mt-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-3">
          {shown.length === 0 && <div className="card-edit p-8 text-center serif italic text-ink-2">Nothing waiting. The queue is clear.</div>}
          {shown.map((s) => (
            <button key={s.id} onClick={() => setSel(s.id)} className={cn("card-edit w-full text-left p-4 flex gap-4 transition-colors", sel === s.id ? "!border-accent" : "hover:border-line-strong")}>
              <Still src={s.cover || IMG.tunnel} alt="" className="h-20 w-14 shrink-0 !rounded-xl" />
              <span className="flex-1 min-w-0"><span className="block display text-xl text-ink truncate">{s.title}</span><span className="block label-sm text-ink-3 mt-1">{s.authorName} · {s.format} · {s.genre}</span><span className="block serif italic text-ink-2 text-sm mt-2 line-clamp-2">{s.hook}</span><span className="block label-sm text-ink-3 mt-2">{s.submittedAt ? `submitted ${timeAgo(s.submittedAt)}` : `updated ${timeAgo(s.updatedAt)}`}{s.featured ? " · featured" : ""}</span></span>
              <StatusPill status={s.status} />
            </button>
          ))}
        </div>
        <div className="lg:col-span-7">
          {!cur ? (
            <div className="card-edit p-12 text-center serif italic text-ink-3">Select a story to read it.</div>
          ) : (
            <div className="card-edit overflow-hidden">
              <div className="relative min-h-[220px] on-image"><Still src={cur.cover || IMG.tunnel} alt="" deep className="absolute inset-0 rounded-none" /><div className="relative p-7 flex flex-col justify-end min-h-[220px]"><div className="label-sm text-accent">{cur.format} · {cur.genre} · {cur.visibility}</div><div className="display text-lg md:text-xl text-ink mt-2">{cur.title}</div><div className="text-sm text-ink-2 mt-2">{cur.authorName} · @{cur.authorHandle}</div></div></div>
              <div className="p-7">
                <p className="serif text-xl text-ink leading-snug">{cur.synopsis}</p>
                <div className="prose-cine mt-8 max-h-[48vh] overflow-y-auto pr-4" data-lenis-prevent>{cur.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
                <div className="rule mt-6 pt-6">
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Editorial note to the author (optional for approval, expected for changes)…" className="input text-base h-20 resize-none" />
                  <div className="flex flex-wrap gap-3 mt-4">
                    {cur.status !== "published" && <button onClick={() => decide("approve")} disabled={busy} className="btn btn-primary btn-sm">Approve & publish</button>}
                    {cur.status !== "published" && <button onClick={() => decide("approve", true)} disabled={busy} className="btn btn-accent btn-sm">Approve & feature</button>}
                    {cur.status === "published" && <button onClick={() => decide("feature")} disabled={busy} className="btn btn-sm">{cur.featured ? "Unfeature" : "Feature"}</button>}
                    {cur.status === "published" && <button onClick={() => decide("unpublish")} disabled={busy} className="btn btn-sm">Unpublish</button>}
                    {cur.status !== "rejected" && cur.status !== "published" && <button onClick={() => decide("reject")} disabled={busy} className="btn btn-sm">Ask for changes</button>}
                    {cur.status === "published" && <Link href={`/story/${cur.slug}`} className="btn btn-ghost btn-sm">View live →</Link>}
                  </div>
                  {cur.review && <p className="label-sm text-ink-3 mt-4">Last decision: {cur.review.decision} by {cur.review.by} · {timeAgo(cur.review.at)}{cur.review.note ? ` · “${cur.review.note}”` : ""}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
