"use client";
import { useState } from "react";
import { useProject } from "@/store/project";
import { ai } from "@/lib/ai";
import type { StoryStructure } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

type Mode = "shorten" | "expand" | "darker" | "funnier" | "emotional" | "surprise";
const MODES: [Mode, string][] = [["shorten", "Shorten"], ["expand", "Expand"], ["darker", "Make darker"], ["funnier", "Make funnier"], ["emotional", "More emotional"], ["surprise", "Surprise me"]];

export function Development({ onCompose }: { onCompose: () => void }) {
  const { project, patch, ctx } = useProject();
  const st = project.structure!;
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const update = (next: Partial<StoryStructure>, version?: string) => patch({ structure: { ...st, ...next } }, version);
  const act = async (key: "logline" | "premise" | "conflict" | "ending", mode: Mode) => {
    setBusy(key);
    const text = await ai.text.rewrite(st[key], mode, ctx);
    update({ [key]: text } as Partial<StoryStructure>, `${MODES.find((m) => m[0] === mode)![1]}: ${key}`);
    setBusy(null);
  };
  const regen = async () => { setBusy("all"); const s = await ai.text.generateStructure(ctx); patch({ structure: s }, "Regenerated structure"); setBusy(null); };

  const Section = ({ id, label, children, actions = true, keyName }: { id: string; label: string; children: React.ReactNode; actions?: boolean; keyName?: "logline" | "premise" | "conflict" | "ending" }) => (
    <section id={id} className="grid md:grid-cols-12 gap-6 py-10 rule">
      <div className="md:col-span-3"><div className="label text-accent">{label}</div></div>
      <div className={cn("md:col-span-9", busy === keyName && "animate-pulse")}>
        {children}
        {actions && keyName && (
          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 label-sm text-ink-3">
            <button onClick={() => setEditing(editing === keyName ? null : keyName)} className="hover:text-ink">{editing === keyName ? "Done" : "Edit"}</button>
            {MODES.map(([m, l]) => <button key={m} onClick={() => act(keyName, m)} className="hover:text-ink" disabled={!!busy}>{l}</button>)}
          </div>
        )}
      </div>
    </section>
  );

  const Text = ({ k, big }: { k: "logline" | "premise" | "conflict" | "ending"; big?: boolean }) =>
    editing === k ? <textarea autoFocus value={st[k]} onChange={(e) => update({ [k]: e.target.value } as any)} className={cn("input serif resize-none", big ? "text-2xl h-32" : "text-lg h-28")} /> : <p className={cn("serif text-ink leading-snug", big ? "text-2xl md:text-3xl" : "text-lg md:text-xl")}>{st[k]}</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="serif italic text-ink-2">The partner suggests structure. You control it. Every rewrite is versioned.</p>
        <button onClick={regen} className="label-sm text-ink-3 hover:text-ink" disabled={!!busy}>Regenerate all</button>
      </div>

      <Section id="logline" label="Logline" keyName="logline"><Text k="logline" big /></Section>
      <Section id="premise" label="Premise" keyName="premise"><Text k="premise" /></Section>

      <Section id="characters" label="Characters" actions={false}>
        <div className="grid sm:grid-cols-2 gap-3">
          {project.characters.map((c) => (
            <div key={c.id} className="card-edit p-5">
              <div className="display text-xl text-ink">{c.name}</div>
              {c.occupation && <div className="label-sm text-ink-3 mt-1">{c.occupation}</div>}
              <dl className="mt-3 space-y-2 text-sm">
                {[["Wants", c.desire], ["Fears", c.fear], ["Secret", c.secret], ["Arc", c.arc]].filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="label-sm text-accent inline mr-2">{k}</dt><dd className="serif inline text-ink">{v}</dd></div>)}
              </dl>
            </div>
          ))}
        </div>
        <p className="label-sm text-ink-3 mt-3">Story bible · {project.characters.length} character{project.characters.length === 1 ? "" : "s"}</p>
      </Section>

      <Section id="world" label="World" actions={false}>
        {project.locations.map((l) => (
          <div key={l.id} className="card-edit p-5 mb-3"><div className="display text-xl text-ink">{l.name}</div>{l.detail && <div className="serif italic text-ink-2 mt-1">{l.detail}</div>}<div className="label-sm text-ink-3 mt-2">{l.real ? "Real place" : "Fictional"}{l.period ? ` · ${l.period}` : ""}</div></div>
        ))}
      </Section>

      <Section id="conflict" label="Conflict" keyName="conflict"><Text k="conflict" /></Section>

      <Section id="themes" label="Themes" actions={false}>
        <div className="flex flex-wrap gap-2">{st.themes.map((t, i) => <span key={i} className="chip cursor-default">{t}</span>)}<button onClick={() => { const t = prompt("Add a theme"); if (t) update({ themes: [...st.themes, t] }); }} className="chip">+ Add</button></div>
      </Section>

      <Section id="arc" label="Story arc" actions={false}>
        <div className="space-y-6">
          {st.acts.map((a, i) => (
            <div key={i}>
              <div className="display text-xl text-ink mb-2">{a.title}</div>
              <ol className="space-y-2">
                {a.beats.map((b, j) => (
                  <li key={j} className="flex gap-4 group">
                    <span className="numeral text-lg text-ink-3 shrink-0 w-8">{i + 1}.{j + 1}</span>
                    <input value={b} onChange={(e) => { const acts = st.acts.map((x, xi) => xi === i ? { ...x, beats: x.beats.map((y, yj) => (yj === j ? e.target.value : y)) } : x); update({ acts }); }} className="input text-base !py-1 !border-transparent focus:!border-line-strong" />
                    <button onClick={() => { const acts = st.acts.map((x, xi) => xi === i ? { ...x, beats: x.beats.filter((_, yj) => yj !== j) } : x); update({ acts }, `Removed beat ${i + 1}.${j + 1}`); }} className="label-sm text-ink-3 opacity-0 group-hover:opacity-100 hover:text-accent">Remove</button>
                  </li>
                ))}
              </ol>
              <button onClick={() => { const acts = st.acts.map((x, xi) => xi === i ? { ...x, beats: [...x.beats, "New beat"] } : x); update({ acts }); }} className="label-sm text-ink-3 hover:text-ink mt-2">+ Add beat</button>
            </div>
          ))}
        </div>
      </Section>

      <Section id="chapters" label="Chapters" actions={false}>
        <p className="serif text-ink-2">{project.scenes.length} scenes on the canvas. Arrange them in the Canvas tab; the composed story follows the arc above.</p>
      </Section>

      <Section id="ending" label="Ending" keyName="ending"><Text k="ending" /></Section>

      <div className="py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="serif italic text-ink-2">When the structure feels right, let it become prose.</p>
        <button onClick={onCompose} className="btn btn-primary" disabled={!!busy}>Compose the story</button>
      </div>
    </div>
  );
}
