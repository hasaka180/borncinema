"use client";
import { useState } from "react";
import { useProject, type Scene } from "@/store/project";
import { ai } from "@/lib/ai";
import { cn } from "@/lib/utils";

export function StoryCanvas() {
  const { project, dispatch, patch, ctx } = useProject();
  const acts = project.structure?.acts || [];
  const [drag, setDrag] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [showLinks, setShowLinks] = useState(false);
  const scenes = project.scenes;
  const chars = project.characters;

  const setScenes = (s: Scene[]) => dispatch({ type: "setScenes", scenes: s });
  const add = (act: number) => setScenes([...scenes, { id: `sc${Date.now()}`, act, title: "New scene", text: "What happens here?", characters: chars[0] ? [chars[0].name] : [] }]);
  const dup = (s: Scene) => { const i = scenes.findIndex((x) => x.id === s.id); const copy = { ...s, id: `sc${Date.now()}`, title: `${s.title} (alt)` }; setScenes([...scenes.slice(0, i + 1), copy, ...scenes.slice(i + 1)]); };
  const del = (id: string) => setScenes(scenes.filter((s) => s.id !== id));
  const move = (id: string, act: number, beforeId?: string) => {
    const s = scenes.find((x) => x.id === id); if (!s) return;
    const rest = scenes.filter((x) => x.id !== id);
    const idx = beforeId ? rest.findIndex((x) => x.id === beforeId) : rest.length;
    const moved = { ...s, act };
    setScenes([...rest.slice(0, idx < 0 ? rest.length : idx), moved, ...rest.slice(idx < 0 ? rest.length : idx)]);
  };
  const rewrite = async (s: Scene, mode: "expand" | "darker" | "surprise") => {
    setBusy(s.id);
    const text = await ai.text.rewrite(s.text, mode, ctx);
    setScenes(scenes.map((x) => (x.id === s.id ? { ...x, text } : x)));
    setBusy(null);
  };
  const branch = (s: Scene) => { patch({}, `Branch from “${s.title}”`); dup(s); };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <p className="serif italic text-ink-2">Drag scenes between acts. Nothing is lost: every change can be restored from Versions.</p>
        <button onClick={() => setShowLinks((s) => !s)} className="label-sm text-ink-3 hover:text-ink">{showLinks ? "Hide" : "Show"} character connections</button>
      </div>
      {showLinks && chars.length > 0 && (
        <div className="mb-8 card-edit p-5 grid sm:grid-cols-2 gap-4 anim-up">
          {chars.map((c) => <div key={c.id}><div className="label-sm text-accent">{c.name}</div><div className="flex flex-wrap gap-2 mt-2">{scenes.filter((s) => s.characters.includes(c.name)).map((s) => <span key={s.id} className="chip cursor-default">{s.title}</span>)}{scenes.filter((s) => s.characters.includes(c.name)).length === 0 && <span className="serif italic text-ink-3 text-sm">in no scenes yet</span>}</div></div>)}
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {acts.map((a, ai_) => (
          <div key={ai_} className="min-h-[300px]" onDragOver={(e) => e.preventDefault()} onDrop={() => { if (drag) { move(drag, ai_); setDrag(null); } }}>
            <div className="flex items-baseline justify-between rule-strong pt-3 mb-4"><span className="display text-xl text-ink">{a.title.split("—")[0].trim()}</span><span className="label-sm text-ink-3">{a.title.split("—")[1]?.trim()}</span></div>
            <div className="space-y-3">
              {scenes.filter((s) => s.act === ai_).map((s, i) => (
                <div key={s.id} draggable onDragStart={() => setDrag(s.id)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.stopPropagation(); if (drag && drag !== s.id) { move(drag, ai_, s.id); setDrag(null); } }}
                  className={cn("card-edit p-4 cursor-grab active:cursor-grabbing group", drag === s.id && "opacity-40", busy === s.id && "animate-pulse")}>
                  <div className="flex justify-between items-baseline">
                    <span className="numeral text-xl text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex gap-3 label-sm text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditing(editing === s.id ? null : s.id)} className="hover:text-ink">Edit</button>
                      <button onClick={() => dup(s)} className="hover:text-ink">Duplicate</button>
                      <button onClick={() => rewrite(s, "expand")} className="hover:text-ink">Rewrite</button>
                      <button onClick={() => rewrite(s, "surprise")} className="hover:text-ink">Alt</button>
                      <button onClick={() => branch(s)} className="hover:text-ink">Branch</button>
                      <button onClick={() => del(s.id)} className="hover:text-accent">Delete</button>
                    </div>
                  </div>
                  {editing === s.id ? (
                    <div className="mt-2 space-y-2">
                      <input value={s.title} onChange={(e) => setScenes(scenes.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)))} className="input text-base" />
                      <textarea value={s.text} onChange={(e) => setScenes(scenes.map((x) => (x.id === s.id ? { ...x, text: e.target.value } : x)))} className="input text-sm h-24 resize-none" />
                      <div className="flex flex-wrap gap-1">{chars.map((c) => <button key={c.id} onClick={() => setScenes(scenes.map((x) => (x.id === s.id ? { ...x, characters: x.characters.includes(c.name) ? x.characters.filter((n) => n !== c.name) : [...x.characters, c.name] } : x)))} className={cn("chip !py-1 !px-2", s.characters.includes(c.name) && "active")}>{c.name.split(" ")[0]}</button>)}</div>
                      <button onClick={() => setEditing(null)} className="label-sm text-accent">Done</button>
                    </div>
                  ) : (
                    <>
                      <div className="display text-xl text-ink mt-1">{s.title}</div>
                      <p className="serif text-sm text-ink-2 leading-snug mt-2 line-clamp-4">{s.text}</p>
                      {s.characters.length > 0 && <div className="flex flex-wrap gap-1 mt-3">{s.characters.map((c) => <span key={c} className="label-sm text-accent">{c.split(" ")[0]}</span>)}</div>}
                    </>
                  )}
                </div>
              ))}
              <button onClick={() => add(ai_)} className="w-full border border-dashed border-line py-3 label-sm text-ink-3 hover:text-ink hover:border-line-strong transition-colors">+ Add scene</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
