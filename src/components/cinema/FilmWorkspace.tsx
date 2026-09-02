"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useProject } from "@/store/project";
import { ai } from "@/lib/ai";
import type { ProjectContext, Shot, VisualDirection } from "@/lib/ai/types";
import { FILM_STAGES, storyBySlug, authorById, IMG } from "@/lib/data";
import type { Story } from "@/lib/types";
import { Still } from "@/components/ui/Still";
import { PreviewPlayer } from "./PreviewPlayer";
import { cn, pad } from "@/lib/utils";

const STYLES = [["realistic", "Realistic"], ["indie", "Indie film"], ["noir", "Neo-noir"], ["animation", "Animation"], ["experimental", "Experimental"], ["period", "Period drama"], ["scifi", "Sci-fi"], ["documentary", "Documentary"], ["stylized", "Stylized"]] as const;

interface Film { title: string; logline: string; genre: string; runtime: string; format: string; directorVision: string; tone: string; stage: number; styleKey?: string; visual?: VisualDirection; shots?: Shot[]; treatment?: string; stills: Record<number, string>; locationStills: Record<string, string> }

export function FilmWorkspace({ adaptSlug }: { adaptSlug?: string }) {
  const { project, patch, ctx: projectCtx } = useProject();
  const adapted: Story | undefined = adaptSlug ? storyBySlug(adaptSlug) : undefined;
  const isAdapt = !!adapted;
  const own = !isAdapt && !!project.story;

  const base = useMemo(() => {
    if (adapted) return { title: adapted.title, logline: adapted.hook, genre: adapted.genre, paragraphs: adapted.chapters.flatMap((c) => c.paragraphs), characters: [{ name: adapted.tags[0] ? "The protagonist" : "Lead", desire: "", fear: "", secret: "" }], location: { name: adapted.tags[0] || "The setting", detail: "" }, cover: adapted.cover, author: authorById(adapted.authorId).name };
    if (project.story) return { title: project.title || project.story.title, logline: project.structure?.logline || project.story.synopsis, genre: project.publish?.genre || "Drama", paragraphs: project.story.paragraphs, characters: project.characters, location: project.locations[0], cover: project.cover || IMG.tunnel, author: "You" };
    return null;
  }, [adapted, project]);

  const ctx: ProjectContext = useMemo(() => isAdapt && adapted
    ? { idea: adapted.hook, genreHint: adapted.genre, protagonist: { name: guessName(adapted) }, location: { name: guessPlace(adapted) }, choices: [] }
    : projectCtx, [isAdapt, adapted, projectCtx]);

  const [film, setFilm] = useState<Film>(() => ({
    title: base?.title || "Untitled film", logline: base?.logline || "", genre: base?.genre || "Drama", runtime: project.film?.runtime || "90 min", format: project.film?.format || "Feature Film",
    directorVision: project.film?.directorVision || "", tone: "", stage: project.film?.stage || 1, styleKey: project.film?.styleKey, visual: project.film?.visual, shots: project.film?.shots, treatment: project.film?.treatment, stills: {}, locationStills: {},
  }));
  const [busy, setBusy] = useState<string | null>(null);
  const [customStyle, setCustomStyle] = useState("");
  const [previewNote, setPreviewNote] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);

  // persist to project if it's the user's own story (never overwrite an adapted original)
  useEffect(() => { if (own) patch({ film: { stage: film.stage, styleKey: film.styleKey, visual: film.visual, shots: film.shots, treatment: film.treatment, runtime: film.runtime, format: film.format, directorVision: film.directorVision } }); }, [film.stage, film.styleKey, film.visual, film.shots, film.treatment, film.runtime, film.format, film.directorVision]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (n: number) => setFilm((f) => ({ ...f, stage: Math.max(f.stage, n) }));
  const [view, setView] = useState(film.stage);

  const genTreatment = async () => { if (!base) return;
    setBusy("treatment");
    const acts = project.structure?.acts || [{ title: "Act I", beats: [base.paragraphs[0]] }, { title: "Act II", beats: [base.paragraphs[Math.floor(base.paragraphs.length / 2)]] }, { title: "Act III", beats: [base.paragraphs[base.paragraphs.length - 1]] }];
    await new Promise((r) => setTimeout(r, 1400));
    const t = acts.map((a) => `${a.title.toUpperCase()}\n\n${a.beats.map((b) => `We open on ${b.charAt(0).toLowerCase()}${b.slice(1)}`.replace("We open on we", "We")).join(" ")}`).join("\n\n");
    setFilm((f) => ({ ...f, treatment: t })); go(3); setBusy(null);
  };
  const genVisual = async (key: string, describe?: string) => { setBusy("visual"); const v = await ai.text.generateVisualDirection(ctx, key, describe); setFilm((f) => ({ ...f, styleKey: key, visual: v })); go(7); setBusy(null); };
  const genShots = async () => { if (!base) return; setBusy("shots"); const s = await ai.text.generateShots(ctx, base.paragraphs[0]); setFilm((f) => ({ ...f, shots: s })); go(8); setBusy(null); };
  const genStill = async (n: number, prompt: string) => { setBusy(`still${n}`); const r = await ai.image.generateStill(prompt, n); setFilm((f) => ({ ...f, stills: { ...f.stills, [n]: r.url } })); setBusy(null); };
  const genLocStill = async (k: string) => { setBusy(`loc${k}`); const r = await ai.image.generateStill(k, k.length); setFilm((f) => ({ ...f, locationStills: { ...f.locationStills, [k]: r.url } })); setBusy(null); };
  const genPreview = async () => { if (!base) return; setBusy("preview"); const frames = film.shots?.map((s) => film.stills[s.n]).filter(Boolean) as string[]; const r = await ai.video.generatePreview(frames.length ? frames : [base.cover], film.logline); setPreviewNote(r.note); setBusy(null); };

  const screenplay = useMemo(() => {
    if (!base) return "";
    const loc = (ctx.location?.name || "LOCATION").toUpperCase();
    const who = (ctx.protagonist?.name || "LEAD").toUpperCase().split(" ")[0];
    const p = base.paragraphs;
    return [
      `INT. ${loc} — NIGHT`, "", p[0], "", `${who}`, `(quietly)`, `“${(p[p.length - 1].split(".")[0] || "I know.").trim()}.”`, "", p[Math.min(1, p.length - 1)], "", "CUT TO:",
    ].join("\n");
  }, [base, ctx]);

  const frames = film.shots?.map((s) => film.stills[s.n]).filter(Boolean) as string[] | undefined;

  if (!base) {
    return (
      <div className="px-6 md:px-14 py-40 text-center max-w-3xl mx-auto">
        <div className="label text-accent mb-4">Turn a story into cinema</div>
        <h1 className="display text-lg md:text-xl text-ink">First, a story.</h1>
        <p className="serif italic text-ink-2 text-xl mt-6">The film workspace begins from a finished story: yours, or one you want to imagine as a film.</p>
        <div className="flex justify-center gap-4 mt-10"><Link href="/create" className="btn btn-primary">Start an idea</Link><Link href="/discover" className="btn">Imagine someone else's</Link></div>
      </div>
    );
  }


  return (
    <div>
      {/* header */}
      <section className="relative min-h-[70vh] flex items-end on-image">
        <Still src={base.cover} alt="" deep zoom className="absolute inset-0 rounded-none opacity-70" />
        <div className="relative px-6 md:px-14 pb-12 pt-32 w-full">
          <div className="label text-accent mb-4">{isAdapt ? `Community adaptation · original by ${base.author}` : "Film project · your story"}</div>
          <input value={film.title} onChange={(e) => setFilm({ ...film, title: e.target.value })} className="display text-[6.2vw] md:text-[3vw] leading-[1.06] text-ink bg-transparent border-0 outline-none w-full" />
          <p className="serif italic text-ink-2 text-lg md:text-xl mt-4 max-w-2xl">Your story is ready. Now let's imagine what it looks like on screen.</p>
          {isAdapt && <p className="label-sm text-ink-3 mt-4">This interpretation is yours. <Link href={`/story/${adapted!.slug}`} className="text-accent">The original story</Link> is unchanged and remains credited to {base.author}.</p>}
        </div>
      </section>

      {/* stage rail */}
      <nav className="sticky top-16 md:top-[72px] z-30 rule overflow-x-auto hide-scroll" style={{ background: "color-mix(in srgb, var(--bg) 88%, transparent)", backdropFilter: "blur(10px)" }} aria-label="Development stages">
        <ol className="flex min-w-max">
          {FILM_STAGES.map((s) => (
            <li key={s.n}>
              <button onClick={() => setView(s.n)} className={cn("flex items-center gap-3 px-5 py-4 border-r border-line transition-colors", view === s.n ? "text-ink" : s.n <= film.stage ? "text-ink-2 hover:text-ink" : "text-ink-3 hover:text-ink-2")}>
                <span className={cn("numeral text-xl", s.n <= film.stage ? "text-accent" : "")}>{pad(s.n)}</span>
                <span className="label">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="px-6 md:px-14 py-14">
        {/* 01 STORY + FILM PROJECT */}
        {view === 1 && (
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <div className="label text-accent mb-4">01 · Story</div>
              <h2 className="display text-lg md:text-xl text-ink">Everything begins here.</h2>
              <div className="prose-cine mt-10 max-h-[60vh] overflow-y-auto pr-4">{base.paragraphs.slice(0, 6).map((p, i) => <p key={i}>{p}</p>)}{base.paragraphs.length > 6 && <p className="label-sm text-ink-3">… {base.paragraphs.length - 6} more paragraphs</p>}</div>
            </div>
            <div className="lg:col-span-5">
              <div className="label text-accent mb-4">Film project</div>
              <div className="space-y-5">
                <F label="Logline"><textarea value={film.logline} onChange={(e) => setFilm({ ...film, logline: e.target.value })} className="input text-base h-24 resize-none" /></F>
                <div className="grid grid-cols-2 gap-5">
                  <F label="Genre"><input value={film.genre} onChange={(e) => setFilm({ ...film, genre: e.target.value })} className="input text-base" /></F>
                  <F label="Runtime"><input value={film.runtime} onChange={(e) => setFilm({ ...film, runtime: e.target.value })} className="input text-base" /></F>
                </div>
                <F label="Format"><div className="flex flex-wrap gap-2">{["Feature Film", "Short Film", "Limited Series", "Animated Feature"].map((x) => <button key={x} onClick={() => setFilm({ ...film, format: x })} className={cn("chip", film.format === x && "active")}>{x}</button>)}</div></F>
                <F label="Director vision"><textarea value={film.directorVision} onChange={(e) => setFilm({ ...film, directorVision: e.target.value })} placeholder="One location, one night, one face…" className="input text-base h-24 resize-none" /></F>
                <F label="Visual tone"><input value={film.tone} onChange={(e) => setFilm({ ...film, tone: e.target.value })} placeholder="Sodium light, wet concrete…" className="input text-base" /></F>
                <button onClick={() => { go(2); setView(2); }} className="btn btn-primary">Write the treatment →</button>
              </div>
            </div>
          </div>
        )}

        {/* 02 TREATMENT */}
        {view === 2 && (
          <div className="max-w-3xl">
            <div className="label text-accent mb-4">02 · Treatment</div>
            <h2 className="display text-lg md:text-xl text-ink">The story, told as a film.</h2>
            {!film.treatment ? (
              <div className="mt-10"><p className="serif italic text-ink-2">A treatment is prose, scene by scene, present tense. The partner will draft one from your structure; you rewrite it.</p><button onClick={genTreatment} className="btn btn-primary mt-6" disabled={!!busy}>{busy === "treatment" ? "Drafting…" : "Draft a treatment"}</button></div>
            ) : (
              <div className="mt-10"><textarea value={film.treatment} onChange={(e) => setFilm({ ...film, treatment: e.target.value })} className="input serif text-lg leading-relaxed h-[50vh] resize-none whitespace-pre-line" /><div className="flex gap-3 mt-4"><button onClick={genTreatment} className="btn btn-sm">Regenerate</button><button onClick={() => setView(3)} className="btn btn-sm btn-primary">Continue to screenplay →</button></div></div>
            )}
          </div>
        )}

        {/* 03 SCREENPLAY */}
        {view === 3 && (
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5"><div className="label text-accent mb-4">03 · Screenplay</div><h2 className="display text-lg md:text-xl text-ink">Scenes, dialogue, action.</h2><p className="serif italic text-ink-2 mt-6">The opening scene, drafted from paragraph one. This is a starting point; the screenplay is yours to write.</p><button onClick={() => { go(4); setView(4); }} className="btn btn-primary mt-8">Accept opening, continue →</button></div>
            <div className="lg:col-span-7"><pre className="card-edit p-8 font-mono text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap text-ink">{screenplay}</pre></div>
          </div>
        )}

        {/* 04 CHARACTERS / CAST */}
        {view === 4 && (
          <div>
            <div className="label text-accent mb-4">04 · Characters</div>
            <h2 className="display text-lg md:text-xl text-ink">Castable people.</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
              {(isAdapt ? [{ name: guessName(adapted!), desire: "", fear: "", secret: "", occupation: "" }] : project.characters).map((c: any, i) => (
                <div key={i} className="card-edit p-6">
                  <div className="aspect-[3/4] gradient-fallback mb-5 flex items-end p-4"><span className="label-sm text-ink-3">Casting reference · placeholder</span></div>
                  <div className="display text-xl text-ink">{c.name}</div>
                  {c.occupation && <div className="label-sm text-ink-3 mt-1">{c.occupation}</div>}
                  <dl className="mt-4 space-y-2 text-sm serif text-ink">{[["Wants", c.desire], ["Fears", c.fear], ["Hides", c.secret]].filter(([, v]) => v).map(([k, v]) => <div key={k}><span className="label-sm text-accent mr-2">{k}</span>{v}</div>)}</dl>
                  <input placeholder="Casting note: an actor who…" className="input text-sm mt-4" />
                </div>
              ))}
            </div>
            <button onClick={() => { go(5); setView(5); }} className="btn btn-primary mt-10">Continue to locations →</button>
          </div>
        )}

        {/* 05 LOCATIONS */}
        {view === 5 && (
          <div>
            <div className="label text-accent mb-4">05 · Locations</div>
            <h2 className="display text-lg md:text-xl text-ink">Where the camera stands.</h2>
            <div className="grid md:grid-cols-2 gap-6 mt-10">
              {(isAdapt ? [{ id: "l", name: guessPlace(adapted!), detail: "", real: true }] : project.locations).map((l: any) => (
                <div key={l.id} className="card-edit p-6">
                  <div className="aspect-video mb-5">{film.locationStills[l.name] ? <Still src={film.locationStills[l.name]} alt="" vignette className="h-full w-full" /> : <div className={cn("h-full w-full gradient-fallback flex items-center justify-center", busy === `loc${l.name}` && "animate-pulse")}><button onClick={() => genLocStill(l.name)} className="btn btn-sm">Generate reference still</button></div>}</div>
                  <div className="display text-xl text-ink">{l.name}</div>
                  {l.detail && <div className="serif italic text-ink-2 mt-1">{l.detail}</div>}
                  <div className="label-sm text-ink-3 mt-3">{l.real ? "Real place" : "Fictional"} · {ai.image.isMock ? "placeholder imagery" : ai.image.name}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { go(6); setView(6); }} className="btn btn-primary mt-10">Continue to visual language →</button>
          </div>
        )}

        {/* 06 VISUAL LANGUAGE */}
        {view === 6 && (
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <div className="label text-accent mb-4">06 · Visual language</div>
              <h2 className="display text-lg md:text-xl text-ink">How it looks.</h2>
              <div className="flex flex-wrap gap-2 mt-8">{STYLES.map(([k, l]) => <button key={k} onClick={() => genVisual(k)} className={cn("chip", film.styleKey === k && "active")} disabled={!!busy}>{l}</button>)}</div>
              <div className="mt-8">
                <div className="label-sm text-ink-3 mb-2">Describe your own style</div>
                <form onSubmit={(e) => { e.preventDefault(); if (customStyle.trim()) genVisual("indie", customStyle.trim()); }} className="flex gap-3"><input value={customStyle} onChange={(e) => setCustomStyle(e.target.value)} placeholder="Like a memory of a film, shot on expired stock…" className="input text-base" /><button className="btn btn-sm shrink-0" disabled={!!busy}>Translate</button></form>
              </div>
            </div>
            <div className={cn("lg:col-span-7", busy === "visual" && "animate-pulse")}>
              {film.visual ? (
                <div className="anim-up">
                  <div className="flex h-20">{film.visual.palette.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</div>
                  <div className="display text-xl text-ink mt-6">{film.visual.style}</div>
                  <p className="serif text-xl text-ink mt-3">{film.visual.summary}</p>
                  <dl className="grid sm:grid-cols-2 gap-5 mt-8">{[["Lenses", film.visual.lenses], ["Light", film.visual.light], ["Movement", film.visual.movement], ["References", film.visual.references.join(" · ")]].map(([k, v]) => <div key={k} className="rule pt-3"><dt className="label-sm text-accent">{k}</dt><dd className="serif text-ink mt-1">{v}</dd></div>)}</dl>
                  <button onClick={() => { go(7); setView(7); }} className="btn btn-primary mt-10">Continue to storyboard →</button>
                </div>
              ) : <div className="p-12 border border-dashed border-line text-center"><p className="serif italic text-ink-3">Choose a style, or describe one. The partner translates it into a coherent direction.</p></div>}
            </div>
          </div>
        )}

        {/* 07 STORYBOARD */}
        {view === 7 && (
          <div>
            <div className="flex items-end justify-between gap-6"><div><div className="label text-accent mb-4">07 · Storyboard</div><h2 className="display text-lg md:text-xl text-ink">Shot by shot.</h2></div>{film.shots && <button onClick={genShots} className="btn btn-sm" disabled={!!busy}>Regenerate all</button>}</div>
            {!film.shots ? (
              <div className="mt-10"><p className="serif italic text-ink-2">The partner proposes a shot list for the opening scene. Accept, modify, or regenerate each.</p><button onClick={genShots} className="btn btn-primary mt-6" disabled={!!busy}>{busy === "shots" ? "Framing…" : "Suggest shots"}</button></div>
            ) : (
              <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {film.shots.map((s) => (
                  <div key={s.n} className={cn("card-edit p-5 flex flex-col", busy === `still${s.n}` && "animate-pulse")}>
                    <div className="aspect-video mb-4">{film.stills[s.n] ? <Still src={film.stills[s.n]} alt="" vignette className="h-full w-full" /> : <button onClick={() => genStill(s.n, `${s.type} ${s.description} ${film.visual?.style || ""}`)} className="h-full w-full gradient-fallback flex items-center justify-center label-sm text-ink-3 hover:text-ink">Generate frame</button>}</div>
                    <div className="flex justify-between items-baseline"><span className="numeral text-3xl text-accent">Shot {pad(s.n)}</span><span className="label-sm text-ink-3">{s.duration}</span></div>
                    <div className="display text-xl text-ink mt-1">{s.type}</div>
                    {editing === s.n ? <textarea autoFocus value={s.description} onChange={(e) => setFilm({ ...film, shots: film.shots!.map((x) => (x.n === s.n ? { ...x, description: e.target.value } : x)) })} onBlur={() => setEditing(null)} className="input text-sm h-20 resize-none mt-2" /> : <p className="serif text-ink mt-2 leading-snug">{s.description}</p>}
                    <dl className="mt-3 space-y-1 text-xs text-ink-2">{[["Camera", s.camera], ["Lighting", s.lighting], ["Mood", s.mood], ["Location", ctx.location?.name || "—"], ["Characters", ctx.protagonist?.name || "—"]].map(([k, v]) => <div key={k}><span className="label-sm text-ink-3 mr-2">{k}</span>{v}</div>)}</dl>
                    <div className="flex gap-4 mt-4 label-sm text-ink-3 pt-3 rule"><button className="text-accent">Accept</button><button onClick={() => setEditing(s.n)} className="hover:text-ink">Modify</button><button onClick={() => genStill(s.n, `${s.type} alt ${Math.random()}`)} className="hover:text-ink">Regenerate</button></div>
                  </div>
                ))}
              </div>
            )}
            {film.shots && <button onClick={() => { go(8); setView(8); }} className="btn btn-primary mt-10">Build the cinematic preview →</button>}
          </div>
        )}

        {/* 08 PREVIEW */}
        {view === 8 && (
          <div>
            <div className="label text-accent mb-4">08 · Cinematic preview</div>
            <h2 className="display text-lg md:text-xl text-ink">A moving impression.</h2>
            <p className="serif italic text-ink-2 mt-4 max-w-xl">Built from your storyboard frames, camera motion and text overlays. {ai.video.isMock ? "No video model is connected; this is a placeholder preview, not generated footage." : ai.video.name}</p>
            {!previewNote ? <button onClick={genPreview} className="btn btn-primary mt-8" disabled={!!busy}>{busy === "preview" ? "Assembling…" : "Assemble preview"}</button> : (
              <div className="mt-10 anim-up">
                <PreviewPlayer frames={frames && frames.length ? frames : [base.cover, ...(film.visual ? [IMG.corridor, IMG.rain] : [])]} title={film.title} captions={[film.logline, ...(film.shots?.map((s) => s.description) || [])]} palette={film.visual?.palette} note={previewNote} />
                <div className="mt-10 card-edit p-8 grid md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8"><div className="label-sm text-accent mb-2">Wait…</div><div className="display text-lg md:text-xl text-ink">This could actually become cinema.</div><p className="serif italic text-ink-2 mt-3">A filmmaker can discover this project on the Cinema page. Readers keep adding signal while you develop it.</p></div>
                  <div className="md:col-span-4 flex md:justify-end gap-3"><Link href="/cinema" className="btn">Cinema page</Link>{own && project.publish?.slug && <Link href={`/story/${project.publish.slug}`} className="btn btn-primary">Back to the story</Link>}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) { return <div><div className="label-sm text-ink-3 mb-2">{label}</div>{children}</div>; }
function guessName(s: Story) { const m = s.chapters[0]?.paragraphs.join(" ").match(/\b(Lena|Nour|Solveig|Adaeze|Kasper|Wren|Salcedo|Jonas|Chiamaka|Remedios)\b/); return m ? m[1] : "The lead"; }
function guessPlace(s: Story) { return s.tags[0] ? s.tags[0].charAt(0).toUpperCase() + s.tags[0].slice(1) : "The setting"; }
