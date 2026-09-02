"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ideas as seed } from "@/lib/data";
import type { Idea } from "@/lib/types";
import { useProject } from "@/store/project";
import { useRouter } from "next/navigation";
import { cn, timeAgo } from "@/lib/utils";

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>(seed);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<"all" | Idea["status"]>("all");
  const [merging, setMerging] = useState<string | null>(null);
  const { dispatch, patch } = useProject();
  const router = useRouter();

  useEffect(() => { try { const r = localStorage.getItem("bc-ideas"); if (r) setIdeas(JSON.parse(r)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("bc-ideas", JSON.stringify(ideas)); } catch {} }, [ideas]);

  const add = () => { if (!draft.trim()) return; setIdeas((l) => [{ id: `i${Date.now()}`, text: draft.trim(), createdAt: new Date().toISOString(), tags: [], status: "seed" }, ...l]); setDraft(""); };
  const develop = (i: Idea) => { dispatch({ type: "reset" }); setTimeout(() => { patch({ idea: i.text, step: "idea" }); router.push("/create"); }, 0); };
  const merge = (a: Idea, b: Idea) => { setIdeas((l) => [{ id: `i${Date.now()}`, text: `${a.text.replace(/\.$/, "")} — and ${b.text.charAt(0).toLowerCase()}${b.text.slice(1)}`, createdAt: new Date().toISOString(), tags: [...a.tags, ...b.tags], status: "developing", connections: [a.id, b.id] }, ...l.map((x) => (x.id === a.id || x.id === b.id ? { ...x, status: "archived" as const } : x))]); setMerging(null); };
  const setStatus = (id: string, status: Idea["status"]) => setIdeas((l) => l.map((x) => (x.id === id ? { ...x, status } : x)));

  const list = ideas.filter((i) => filter === "all" ? i.status !== "archived" : i.status === filter);

  return (
    <div className="px-6 md:px-14 pt-10 md:pt-16">
      <div className="label text-accent mb-5">My ideas</div>
      <h1 className="display text-[6.4vw] md:text-[3.2vw] leading-[1.06] text-ink">The vault.</h1>
      <p className="serif italic text-ink-2 text-xl mt-5 max-w-xl">Incomplete thoughts are welcome here. Some of them are films.</p>

      <div className="mt-14 card-edit p-6 md:p-8">
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="A restaurant that only appears once every ten years…" className="textarea-cine !text-2xl md:!text-3xl h-24" />
        <div className="flex justify-between items-center mt-4 rule pt-4">
          <span className="label-sm text-ink-3">Kept private until you develop it</span>
          <button onClick={add} className="btn btn-primary btn-sm" disabled={!draft.trim()}>Keep this</button>
        </div>
      </div>

      <div className="mt-12 flex gap-6 label text-ink-3 rule pt-5">
        {(["all", "seed", "developing", "story", "archived"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={cn("link-line py-1", filter === f && "text-ink active")}>{f}</button>)}
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {list.map((i) => {
          const links = (i.connections || []).map((c) => ideas.find((x) => x.id === c)).filter(Boolean) as Idea[];
          return (
            <div key={i.id} className={cn("card-edit p-7 flex flex-col", merging === i.id && "!border-accent")}>
              <div className="flex justify-between label-sm text-ink-3"><span>{i.status}</span><span>{timeAgo(i.createdAt)}</span></div>
              <p className="serif text-2xl leading-snug text-ink mt-4 flex-1">{i.text}</p>
              {links.length > 0 && <div className="mt-4 label-sm text-accent">Connected: {links.map((l) => l.text.slice(0, 40) + "…").join(" · ")}</div>}
              <div className="flex flex-wrap gap-2 mt-6">
                <button onClick={() => develop(i)} className="chip active">Develop this idea</button>
                {merging && merging !== i.id ? <button onClick={() => merge(ideas.find((x) => x.id === merging)!, i)} className="chip">Merge with this</button> : <button onClick={() => setMerging(merging === i.id ? null : i.id)} className="chip">{merging === i.id ? "Cancel merge" : "Merge"}</button>}
                <button onClick={() => develop(i)} className="chip">Turn into story</button>
                <button onClick={() => setStatus(i.id, i.status === "archived" ? "seed" : "archived")} className="chip">{i.status === "archived" ? "Restore" : "Archive"}</button>
                <button className="chip">Share</button>
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p className="serif italic text-ink-3 py-20 text-center">Nothing here. That is fine. Ideas arrive when they arrive.</p>}

      <div className="mt-16 rule pt-8 grid md:grid-cols-12 gap-8">
        <div className="md:col-span-4 label text-ink-3">Connections the partner noticed</div>
        <div className="md:col-span-8 space-y-4">
          <p className="serif text-lg text-ink">Three of your ideas are about places with rules: a town where nobody lies, a hotel where every room is a different year, a radio station stuck on one forecast. That is one world, not three.</p>
          <p className="serif text-lg text-ink">The lighthouse keeper and the translator share a shape: someone who receives messages that were not meant for them. Consider merging.</p>
          <Link href="/create" className="btn btn-ghost">Develop the combined idea →</Link>
        </div>
      </div>
    </div>
  );
}
