"use client";
import { useState } from "react";
import { stories, authors, GENRES, comments, storyById, authorById } from "@/lib/data";
import { cn } from "@/lib/utils";

const REPORTS = [
  { id: "r1", kind: "comment", target: "m3", reason: "Spoilers without warning", by: "a5" },
  { id: "r2", kind: "story", target: "s11", reason: "Possible plagiarism claim", by: "a7" },
  { id: "r3", kind: "user", target: "a4", reason: "Repeated self-promotion in threads", by: "a6" },
];

export function ModerationClient() {
  const [tab, setTab] = useState<"reports" | "feature" | "taxonomy" | "users">("reports");
  const [resolved, setResolved] = useState<string[]>([]);
  const [featured, setFeatured] = useState<string[]>(stories.filter((s) => s.featured).map((s) => s.id));
  const [featCreators, setFeatCreators] = useState<string[]>(["a1", "a8"]);
  const [suspended, setSuspended] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([...GENRES]);
  const [newGenre, setNewGenre] = useState("");
  const toggle = (list: string[], set: (v: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  return (
    <div className="max-w-6xl">
      <div className="label text-accent mb-3">Editorial desk · Moderation</div>
      <h1 className="display text-[5.8vw] md:text-[2.6vw] leading-[1.06] text-ink">Keep the room civil.</h1>
      <div className="mt-10 flex gap-7 label text-ink-3 rule pt-5">
        {(["reports", "feature", "taxonomy", "users"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("link-line py-1", tab === t && "text-ink active")}>{t}</button>)}
      </div>

      {tab === "reports" && (
        <div className="mt-8">
          {REPORTS.map((r) => {
            const done = resolved.includes(r.id);
            const label = r.kind === "comment" ? comments.find((c) => c.id === r.target)?.text : r.kind === "story" ? storyById(r.target)?.title : authorById(r.target).name;
            return (
              <div key={r.id} className={cn("grid md:grid-cols-12 gap-6 py-6 rule", done && "opacity-40")}>
                <div className="md:col-span-2 label-sm text-ink-3">{r.kind} · by {authorById(r.by).name}</div>
                <div className="md:col-span-6"><div className="serif text-lg text-ink leading-snug">“{label}”</div><div className="label-sm text-accent mt-2">{r.reason}</div></div>
                <div className="md:col-span-4 flex gap-2 justify-end">
                  <button onClick={() => setResolved((l) => [...l, r.id])} className="btn btn-sm">Dismiss</button>
                  <button onClick={() => setResolved((l) => [...l, r.id])} className="btn btn-sm btn-primary">{r.kind === "user" ? "Suspend" : "Remove"}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "feature" && (
        <div className="mt-8 grid md:grid-cols-2 gap-14">
          <div><div className="label text-ink-3 mb-4">Feature stories</div>{stories.map((s) => <button key={s.id} onClick={() => toggle(featured, setFeatured, s.id)} className="flex justify-between w-full py-3 rule text-left"><span className="display text-xl">{s.title}</span><span className={cn("label-sm", featured.includes(s.id) ? "text-accent" : "text-ink-3")}>{featured.includes(s.id) ? "Featured" : "Feature"}</span></button>)}</div>
          <div><div className="label text-ink-3 mb-4">Feature creators</div>{authors.map((a) => <button key={a.id} onClick={() => toggle(featCreators, setFeatCreators, a.id)} className="flex justify-between w-full py-3 rule text-left"><span className="text-ink">{a.name}</span><span className={cn("label-sm", featCreators.includes(a.id) ? "text-accent" : "text-ink-3")}>{featCreators.includes(a.id) ? "Featured" : "Feature"}</span></button>)}</div>
        </div>
      )}

      {tab === "taxonomy" && (
        <div className="mt-8 max-w-xl">
          <div className="label text-ink-3 mb-4">Genres</div>
          <div className="flex flex-wrap gap-2">{genres.map((g) => <button key={g} onClick={() => setGenres((l) => l.filter((x) => x !== g))} className="chip">{g} ×</button>)}</div>
          <div className="flex gap-3 mt-6"><input value={newGenre} onChange={(e) => setNewGenre(e.target.value)} placeholder="New genre" className="input text-base" /><button onClick={() => { if (newGenre.trim()) { setGenres((l) => [...l, newGenre.trim()]); setNewGenre(""); } }} className="btn btn-sm">Add</button></div>
          <div className="label text-ink-3 mt-12 mb-4">Categories</div>
          <div className="flex flex-wrap gap-2">{["Fiction", "Non-Fiction", "Novels", "Short Stories", "Poetry", "Articles"].map((c) => <span key={c} className="chip">{c}</span>)}</div>
        </div>
      )}

      {tab === "users" && (
        <div className="mt-8">{authors.map((a) => <div key={a.id} className={cn("flex items-center justify-between py-3 rule", suspended.includes(a.id) && "opacity-40")}><span className="text-ink">{a.name} <span className="label-sm text-ink-3 ml-3">@{a.handle}</span></span><button onClick={() => toggle(suspended, setSuspended, a.id)} className="btn btn-sm">{suspended.includes(a.id) ? "Reinstate" : "Suspend"}</button></div>)}</div>
      )}
    </div>
  );
}
