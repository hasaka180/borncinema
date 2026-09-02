"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoryDoc } from "@/lib/server/db";
import { Still } from "@/components/ui/Still";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { GENRES, FORMATS, IMG } from "@/lib/data";
import { ai } from "@/lib/ai";
import { AIBadge } from "@/components/create/AIBadge";
import { cn } from "@/lib/utils";

const COVERS = [IMG.tunnel, IMG.corridor, IMG.station, IMG.rainWindow, IMG.nightCity, IMG.fogForest, IMG.windowLight, IMG.dubaiNight, IMG.aurora, IMG.ocean, IMG.hotel, IMG.neon];

export function EditorClient({ initial }: { initial: StoryDoc }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [para, setPara] = useState<number | null>(null);
  const set = (k: keyof StoryDoc, v: unknown) => setS((x) => ({ ...x, [k]: v }));
  const save = async (action?: string) => {
    setSaving(action || "save");
    const r = await fetch(`/api/stories/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: s.title, hook: s.hook, synopsis: s.synopsis, cover: s.cover, genre: s.genre, format: s.format, visibility: s.visibility, allowRemixes: s.allowRemixes, tags: s.tags, paragraphs: s.paragraphs, action }) });
    const d = await r.json(); if (d.story) setS(d.story);
    setSaving(null); router.refresh();
  };
  const rewrite = async (i: number, mode: "shorten" | "expand" | "darker" | "emotional" | "surprise") => {
    setSaving(`p${i}`);
    const t = await ai.text.rewrite(s.paragraphs[i], mode, { idea: s.hook, choices: [] });
    set("paragraphs", s.paragraphs.map((p, j) => (j === i ? t : p)));
    setSaving(null);
  };
  const locked = s.status === "submitted";

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4"><Link href="/dashboard/stories" className="label-sm text-ink-3 hover:text-ink">← My stories</Link><StatusPill status={s.status} /></div>
        <div className="flex items-center gap-3">
          <AIBadge className="hidden md:inline-flex mr-3" />
          <button onClick={() => save()} className="btn btn-sm" disabled={!!saving}>{saving === "save" ? "Saving…" : "Save draft"}</button>
          {s.status !== "submitted" && s.status !== "published" && <button onClick={() => save("submit")} className="btn btn-primary btn-sm" disabled={!!saving}>{s.visibility === "public" ? "Submit for review" : "Publish"}</button>}
          {s.status === "submitted" && <button onClick={() => save("withdraw")} className="btn btn-sm" disabled={!!saving}>Withdraw</button>}
          {s.status === "published" && <Link href={`/story/${s.slug}`} className="btn btn-primary btn-sm">View live</Link>}
        </div>
      </div>
      {locked && <p className="mt-4 serif italic text-ink-2">This story is with the editorial desk. Withdraw it to make changes.</p>}
      {s.review?.decision === "reject" && <div className="mt-4 card-edit p-4"><div className="label-sm text-accent mb-1">Editorial note · {s.review.by}</div><p className="serif text-ink">{s.review.note || "Needs changes before it can go public."}</p></div>}

      <div className="mt-8 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <input value={s.title} onChange={(e) => set("title", e.target.value)} disabled={locked} className="display text-xl md:text-3xl text-ink bg-transparent border-0 outline-none w-full" />
          <label className="block"><span className="label-sm text-ink-3">Hook</span><input value={s.hook} onChange={(e) => set("hook", e.target.value)} disabled={locked} className="input" /></label>
          <label className="block"><span className="label-sm text-ink-3">Synopsis</span><textarea value={s.synopsis} onChange={(e) => set("synopsis", e.target.value)} disabled={locked} className="input text-base h-24 resize-none" /></label>
          <div>
            <div className="label-sm text-ink-3 mb-3">Story · {s.paragraphs.length} paragraphs</div>
            <div className="prose-cine">
              {s.paragraphs.map((p, i) => (
                <div key={i} className={cn("relative group/p", saving === `p${i}` && "animate-pulse")}>
                  {para === i && !locked ? <textarea autoFocus value={p} onChange={(e) => set("paragraphs", s.paragraphs.map((x, j) => (j === i ? e.target.value : x)))} onBlur={() => setPara(null)} className="input serif text-[1.12rem] leading-[1.8] h-44 resize-none mb-6" /> : <p onClick={() => !locked && setPara(i)} className={cn(!locked && "cursor-text hover:bg-bg-2/60 -mx-2 px-2 rounded-lg transition-colors")}>{p}</p>}
                  {!locked && <div className="absolute -right-2 lg:-right-40 top-0 lg:w-36 flex lg:flex-col gap-2 label-sm text-ink-3 opacity-0 group-hover/p:opacity-100 transition-opacity">{(["shorten", "expand", "darker", "emotional", "surprise"] as const).map((m) => <button key={m} onClick={() => rewrite(i, m)} className="hover:text-accent text-left">{m}</button>)}</div>}
                </div>
              ))}
            </div>
            {!locked && <button onClick={() => set("paragraphs", [...s.paragraphs, "New paragraph."])} className="btn btn-ghost">+ Add paragraph</button>}
          </div>
        </div>
        <aside className="lg:col-span-4 space-y-6">
          <div className="card-edit p-5">
            <div className="label-sm text-ink-3 mb-3">Cover</div>
            <Still src={s.cover || IMG.tunnel} alt="" vignette className="aspect-[4/5] !rounded-2xl mb-3" />
            <div className="grid grid-cols-6 gap-1.5">{COVERS.map((c) => <button key={c} disabled={locked} onClick={() => set("cover", c)} className={cn("aspect-square rounded-lg overflow-hidden border-2", s.cover === c ? "border-accent" : "border-transparent")}><Still src={c} alt="" className="h-full w-full !rounded-none" /></button>)}</div>
          </div>
          <div className="card-edit p-5 space-y-4">
            <label className="block"><span className="label-sm text-ink-3">Genre</span><select value={s.genre} disabled={locked} onChange={(e) => set("genre", e.target.value)} className="input text-base">{GENRES.map((g) => <option key={g} value={g} style={{ background: "var(--bg)" }}>{g}</option>)}</select></label>
            <label className="block"><span className="label-sm text-ink-3">Format</span><select value={s.format} disabled={locked} onChange={(e) => set("format", e.target.value)} className="input text-base">{FORMATS.map((g) => <option key={g} value={g} style={{ background: "var(--bg)" }}>{g}</option>)}</select></label>
            <div><span className="label-sm text-ink-3">Visibility</span><div className="flex gap-2 mt-2">{(["public", "unlisted", "private"] as const).map((v) => <button key={v} disabled={locked} onClick={() => set("visibility", v)} className={cn("chip", s.visibility === v && "active")}>{v}</button>)}</div><p className="label-sm text-ink-3 mt-2">Public stories are read by the editorial desk first.</p></div>
            <label className="flex items-center gap-3 text-sm text-ink"><input type="checkbox" checked={s.allowRemixes} disabled={locked} onChange={(e) => set("allowRemixes", e.target.checked)} /> Allow remixes</label>
            <label className="block"><span className="label-sm text-ink-3">Tags</span><input value={s.tags.join(", ")} disabled={locked} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} className="input text-base" /></label>
          </div>
          <Link href="/cinema/develop" className="card-edit p-5 block hover:border-accent transition-colors"><div className="label-sm text-accent mb-1">Next</div><div className="display text-xl text-ink">Turn this story into cinema</div><p className="serif italic text-ink-2 text-sm mt-1">Treatment, cast, visual language, storyboard.</p></Link>
        </aside>
      </div>
    </div>
  );
}
