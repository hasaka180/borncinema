"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProject, type Step } from "@/store/project";
import { ai } from "@/lib/ai";
import type { Suggestion } from "@/lib/ai/types";
import { SuggestionGrid } from "./SuggestionGrid";
import { StoryPartner } from "./StoryPartner";
import { StoryCanvas } from "./StoryCanvas";
import { VersionHistory } from "./VersionHistory";
import { Development } from "./Development";
import { PublishFlow } from "./PublishFlow";
import { Still } from "@/components/ui/Still";
import { AIBadge } from "./AIBadge";
import { cn, pad } from "@/lib/utils";

const ORDER: Step[] = ["idea", "interpret", "name", "location", "locationDetail", "desire", "fear", "secret", "direction", "structure", "compose", "read", "publish", "published"];
const CHAPTER: Record<Step, string> = { idea: "The idea", interpret: "Exploring", name: "Who is she?", location: "Where does this happen?", locationDetail: "Where exactly?", desire: "What does she want?", fear: "What does she fear?", secret: "What is she hiding?", direction: "Which way?", structure: "Story development", compose: "Composing", read: "Your story", publish: "Publish", published: "It exists", cinema: "Cinema" };

export function IdeaFlow({ embedded = false }: { embedded?: boolean }) {
  const { project, dispatch, patch, go, ctx, protagonist, primaryLocation } = useProject();
  const router = useRouter();
  const step = project.step;
  const [items, setItems] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [tab, setTab] = useState<"dev" | "canvas" | "versions">("dev");
  const [clarify, setClarify] = useState<{ text: string; options: Suggestion[] } | null>(null);
  const [composed, setComposed] = useState<string[]>([]);
  const [titles, setTitles] = useState<Suggestion[]>([]);
  const [editPara, setEditPara] = useState<number | null>(null);
  const [paraBusy, setParaBusy] = useState<number | null>(null);
  const [ideaDraft, setIdeaDraft] = useState(project.idea);
  const [interp, setInterp] = useState<string[]>([]);

  useEffect(() => { setIdeaDraft(project.idea); }, [project.idea]);

  const load = useCallback(async (fn: () => Promise<Suggestion[]>) => { setLoading(true); setItems([]); const r = await fn(); setItems(r); setLoading(false); }, []);

  // load suggestions for each step
  useEffect(() => {
    if (step === "name") load(() => ai.text.generateCharacterNames(ctx));
    if (step === "location") load(() => ai.text.generateLocations(ctx));
    if (step === "locationDetail" && primaryLocation) load(() => ai.text.refineLocation(ctx, primaryLocation.name));
    if (step === "desire") load(() => ai.text.generateCharacterField(ctx, "desire"));
    if (step === "fear") load(() => ai.text.generateCharacterField(ctx, "fear"));
    if (step === "secret") load(() => ai.text.generateCharacterField(ctx, "secret"));
    if (step === "direction") load(() => ai.text.generateDirections(ctx));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // interpret step: progressive reveal
  useEffect(() => {
    if (step !== "interpret") return;
    let alive = true;
    (async () => {
      setInterp([]);
      const r = await ai.text.interpretIdea(project.idea);
      if (!alive) return;
      patch({ interpretation: r });
      setInterp([r.summary]); await new Promise((res) => setTimeout(res, 900));
      if (!alive) return;
      setInterp([r.summary, r.firstQuestion]);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // structure generation when entering structure step
  useEffect(() => {
    if (step !== "structure" || project.structure) return;
    (async () => {
      setLoading(true);
      const s = await ai.text.generateStructure(ctx);
      const scenes = s.acts.flatMap((a, ai_) => a.beats.map((b, bi) => ({ id: `sc${ai_}${bi}`, act: ai_, title: b.split(".")[0].slice(0, 42), text: b, characters: protagonist ? [protagonist.name] : [] })));
      dispatch({ type: "setScenes", scenes });
      patch({ structure: s }, "Structure proposed");
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // compose
  useEffect(() => {
    if (step !== "compose" || !project.structure) return;
    let alive = true;
    (async () => {
      setComposed([]);
      const story = await ai.text.composeStory(ctx, project.structure!);
      if (!alive) return;
      for (let i = 0; i < story.paragraphs.length; i++) { await new Promise((r) => setTimeout(r, 260)); if (!alive) return; setComposed(story.paragraphs.slice(0, i + 1)); }
      patch({ story, title: project.title || story.title }, "Story composed");
      const t = await ai.text.generateTitles(ctx); if (alive) setTitles(t);
      await new Promise((r) => setTimeout(r, 600));
      if (alive) go("read");
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const choose = (text: string) => {
    dispatch({ type: "choice", text });
    switch (step) {
      case "name": dispatch({ type: "upsertCharacter", character: { id: "c1", name: text } }); patch({}, `Protagonist: ${text}`); go("location"); break;
      case "location": dispatch({ type: "upsertLocation", location: { id: "l1", name: text, real: !/fiction/i.test(text) } }); go("locationDetail"); break;
      case "locationDetail": dispatch({ type: "upsertLocation", location: { id: "l1", name: primaryLocation!.name, real: primaryLocation!.real, detail: text } }); patch({}, `Location: ${primaryLocation!.name}`); go("desire"); break;
      case "desire": dispatch({ type: "upsertCharacter", character: { ...protagonist!, desire: text } }); go("fear"); break;
      case "fear": dispatch({ type: "upsertCharacter", character: { ...protagonist!, fear: text } }); go("secret"); break;
      case "secret": dispatch({ type: "upsertCharacter", character: { ...protagonist!, secret: text } }); patch({}, `Character defined: ${protagonist!.name}`); go("direction"); break;
      case "direction": patch({ direction: text }, `Direction: ${text}`); go("structure"); break;
    }
  };

  const more = (hint?: string) => {
    const h = hint ? `like ${hint}` : undefined;
    if (step === "name") load(() => ai.text.generateCharacterNames(ctx, h));
    else if (step === "location") load(() => ai.text.generateLocations(ctx, h));
    else if (step === "locationDetail") load(() => ai.text.refineLocation(ctx, primaryLocation!.name));
    else if (step === "direction") load(() => ai.text.generateDirections(ctx));
    else load(() => ai.text.generateCharacterField(ctx, step as any, h));
  };
  const describe = (hint: string) => {
    dispatch({ type: "choice", text: `wants ${step}: ${hint}` });
    if (step === "name") load(() => ai.text.generateCharacterNames(ctx, hint));
    else if (step === "location") load(() => ai.text.generateLocations(ctx, hint));
    else if (step === "locationDetail") load(() => ai.text.refineLocation(ctx, hint));
    else if (step === "direction") load(() => ai.text.generateDirections({ ...ctx, tone: hint }));
    else load(() => ai.text.generateCharacterField(ctx, step as any, hint));
  };

  const back = () => { const i = ORDER.indexOf(step); if (i > 0) go(ORDER[i - 1] === "interpret" ? "idea" : ORDER[i - 1]); };
  const restart = () => { if (confirm("Start over? Your current project stays in version history until you reset it.")) { dispatch({ type: "reset" }); setIdeaDraft(""); } };

  const rewritePara = async (i: number, mode: any) => {
    if (!project.story) return;
    setParaBusy(i);
    const t = await ai.text.rewrite(project.story.paragraphs[i], mode, ctx);
    patch({ story: { ...project.story, paragraphs: project.story.paragraphs.map((p, j) => (j === i ? t : p)) } }, `Paragraph ${i + 1}: ${mode}`);
    setParaBusy(null);
  };

  const progress = Math.max(0, ORDER.indexOf(step)) / (ORDER.length - 1);
  const she = protagonist?.name?.split(" ")[0] || "your character";

  return (
    <div className="relative">
      {/* top rail */}
      <div className="fixed top-16 md:top-[72px] inset-x-0 z-40 h-px" style={{ background: "var(--line)" }}><div className="h-full bg-accent transition-[width] duration-1000 ease-cine" style={{ width: `${progress * 100}%` }} /></div>
      <div className="px-6 md:px-14 pt-8 flex items-center justify-between label-sm text-ink-3">
        <div className="flex items-center gap-4">
          {step !== "idea" && <button onClick={back} className="hover:text-ink">← Back</button>}
          <span>Chapter {pad(Math.max(1, ORDER.indexOf(step)))} · {CHAPTER[step]}</span>
        </div>
        <div className="flex items-center gap-5">
          {project.versions.length > 0 && <span>v{pad(project.versions.length + 1)}</span>}
          <button onClick={() => setPartnerOpen(true)} className="hover:text-accent text-accent">Story Partner</button>
          {project.idea && <button onClick={restart} className="hover:text-ink">Start over</button>}
        </div>
      </div>

      <StoryPartner open={partnerOpen} onClose={() => setPartnerOpen(false)} />

      {/* ------------------------------------------------ IDEA */}
      {step === "idea" && (
        <section className="px-6 md:px-14 pt-12 md:pt-0 min-h-[80vh] flex flex-col justify-center max-w-5xl mx-auto w-full">
          <div className="label text-accent mb-6 anim-up">Start an idea</div>
          <h1 className="display text-[6.4vw] md:text-[3.4vw] leading-[1.06] text-ink anim-up d-1">What's in your head?</h1>
          <div className="mt-12 anim-up d-3">
            <div className="serif italic text-ink-3 text-xl mb-2">I have an idea…</div>
            <textarea value={ideaDraft} onChange={(e) => setIdeaDraft(e.target.value)} placeholder="A woman receives a phone call from herself 20 years in the future…" className="textarea-cine h-40 md:h-48" autoFocus />
            <div className="rule pt-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                <button onClick={() => { patch({ idea: ideaDraft.trim() }, "Original idea"); go("interpret"); }} className="btn btn-primary" disabled={ideaDraft.trim().length < 8}>Help me explore it</button>
                <button onClick={async () => { setClarify({ text: "…", options: [] }); setClarify(await ai.text.clarify(ctx, ideaDraft)); }} className="btn btn-ghost" disabled={ideaDraft.trim().length < 4}>I can't quite say it</button>
              </div>
              <AIBadge />
            </div>
          </div>
          {clarify && (
            <div className="mt-10 card-edit p-6 anim-up">
              <div className="label-sm text-accent mb-3">The partner</div>
              <p className="serif text-xl text-ink">{clarify.text}</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-5">{clarify.options.map((o) => <button key={o.id} onClick={() => { const t = o.text.replace(/^[A-D] — /, ""); if (t.startsWith("Something else")) { setClarify(null); return; } setIdeaDraft((d) => `${d.trim()} — ${t.charAt(0).toLowerCase()}${t.slice(1)}`); setClarify(null); }} className="suggestion"><span className="serif text-lg">{o.text}</span></button>)}</div>
              <p className="label-sm text-ink-3 mt-4">Which feels closest? This is creative discovery, not a form.</p>
            </div>
          )}
          <div className="mt-16 anim-up d-6">
            <div className="label-sm text-ink-3 mb-4">Or begin from the vault</div>
            <div className="flex flex-wrap gap-2">{["A city where nobody can lie.", "A restaurant that only appears once every ten years.", "A lighthouse keeper who receives letters addressed to ships that sank."].map((t) => <button key={t} onClick={() => setIdeaDraft(t)} className="chip">{t}</button>)}</div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------ INTERPRET */}
      {step === "interpret" && (
        <section className="px-6 md:px-14 min-h-[80vh] flex flex-col justify-center max-w-4xl mx-auto w-full">
          <p className="serif italic text-ink-3 text-xl">“{project.idea}”</p>
          <div className="mt-12 space-y-6 min-h-[200px]">
            {interp.length === 0 && <div className="flex items-center gap-3 label-sm text-ink-3"><span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />Reading your idea…</div>}
            {interp.map((line, i) => <p key={i} className={cn("serif leading-snug anim-up", i === 0 ? "text-2xl md:text-3xl text-ink" : "display text-lg md:text-xl text-ink")}>{line}</p>)}
          </div>
          {interp.length === 2 && (
            <div className="mt-12 flex flex-wrap gap-4 anim-up">
              <button onClick={() => go("name")} className="btn btn-primary">Let's find her name</button>
              <button onClick={() => setPartnerOpen(true)} className="btn">I see it differently</button>
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------ SUGGESTION STEPS */}
      {(["name", "location", "locationDetail", "desire", "fear", "secret", "direction"] as Step[]).includes(step) && (
        <section className="px-6 md:px-14 pt-16 pb-24 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="label text-accent mb-5">{step === "name" ? "Character name" : step === "location" ? "Location" : step === "locationDetail" ? "Location · closer" : step === "direction" ? "Story direction" : `Character · ${step}`}</div>
            <h2 className="display text-[5.8vw] md:text-[2.6vw] leading-[1.06] text-ink">
              {step === "name" && <>What is<br />her name?</>}
              {step === "location" && <>Where does<br />this happen?</>}
              {step === "locationDetail" && <>Where in<br />{primaryLocation?.name.split(",")[0]}?</>}
              {step === "desire" && <>What does<br />{she} want?</>}
              {step === "fear" && <>What does<br />{she} fear?</>}
              {step === "secret" && <>What is<br />{she} hiding?</>}
              {step === "direction" && <>Which way<br />does this go?</>}
            </h2>
            <p className="serif italic text-ink-2 text-xl mt-6 max-w-sm">
              {step === "name" && "A name carries a world. Pick one, edit one, or describe the feeling you're after."}
              {step === "location" && "Real or invented. If you describe a place, I'll produce better options."}
              {step === "locationDetail" && "Cities are many places. Choose the one your story lives in."}
              {step === "desire" && "Desire is the engine. It doesn't have to be noble."}
              {step === "fear" && "The story will make her face this. Choose carefully."}
              {step === "secret" && "The thing she doesn't say is the thing the reader is here for."}
              {step === "direction" && "Four ways this could go. You're not locked in; you can branch later."}
            </p>
            {/* story bible so far */}
            <div className="mt-10 card-edit p-5">
              <div className="label-sm text-ink-3 mb-3">Story bible</div>
              <div className="space-y-2 text-sm">
                <div><span className="label-sm text-accent mr-2">Idea</span><span className="serif text-ink line-clamp-2">{project.idea}</span></div>
                {project.interpretation && <div><span className="label-sm text-accent mr-2">Genre</span><span className="serif text-ink">{project.interpretation.genre}</span></div>}
                {protagonist && <div><span className="label-sm text-accent mr-2">Protagonist</span><span className="serif text-ink">{protagonist.name}{protagonist.desire ? ` · wants ${protagonist.desire.toLowerCase()}` : ""}</span></div>}
                {primaryLocation && <div><span className="label-sm text-accent mr-2">Place</span><span className="serif text-ink">{primaryLocation.name}{primaryLocation.detail ? ` · ${primaryLocation.detail}` : ""}</span></div>}
                {project.direction && <div><span className="label-sm text-accent mr-2">Direction</span><span className="serif text-ink">{project.direction}</span></div>}
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 lg:pt-4">
            <SuggestionGrid items={items} loading={loading} onUse={choose} onMore={more} onDescribe={describe}
              describePlaceholder={step === "name" ? "Something more Middle Eastern, elegant and mysterious…" : step === "location" || step === "locationDetail" ? "A city that feels futuristic but lonely…" : step === "direction" ? "Darker. Slower. More about the sister…" : "Something quieter, more domestic…"}
              ownPlaceholder={step === "name" ? "Her name is…" : "In my version…"} />
          </div>
        </section>
      )}

      {/* ------------------------------------------------ STRUCTURE / DEVELOPMENT */}
      {step === "structure" && (
        <section className="px-6 md:px-14 pt-14 pb-24">
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8">
              <div className="label text-accent mb-4">Story development</div>
              <h2 className="display text-[5.8vw] md:text-[2.6vw] leading-[1.06] text-ink">{project.title || "Your story is becoming clearer."}</h2>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end gap-6 label rule lg:border-0 pt-4 lg:pt-0">
              {([["dev", "Development"], ["canvas", "Canvas"], ["versions", "Versions"]] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn("link-line py-1", tab === k ? "text-ink active" : "text-ink-3")}>{l}</button>)}
            </div>
          </div>
          <div className="mt-12">
            {!project.structure ? (
              <div className="py-32 text-center"><div className="flex items-center justify-center gap-3 label-sm text-ink-3"><span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />Proposing a structure for {she} in {primaryLocation?.name}…</div></div>
            ) : tab === "dev" ? <Development onCompose={() => go("compose")} /> : tab === "canvas" ? <StoryCanvas /> : <VersionHistory />}
          </div>
        </section>
      )}

      {/* ------------------------------------------------ COMPOSE */}
      {step === "compose" && (
        <section className="px-6 md:px-14 pt-20 pb-24 max-w-[720px] mx-auto">
          <div className="text-center mb-14"><div className="label text-accent mb-4">Composing</div><div className="display text-lg md:text-xl text-ink">Now it exists.</div></div>
          <div className="prose-cine">{composed.map((p, i) => <p key={i} className="anim-up">{p}</p>)}</div>
          {composed.length === 0 && <div className="flex items-center justify-center gap-3 label-sm text-ink-3"><span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />Writing from your structure…</div>}
        </section>
      )}

      {/* ------------------------------------------------ READ / EDIT */}
      {step === "read" && project.story && (
        <section className="px-6 md:px-14 pt-14 pb-24">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 max-w-[720px]">
              <div className="label text-accent mb-4">Draft · v{pad(project.versions.length + 1)}</div>
              <input value={project.title || project.story.title} onChange={(e) => patch({ title: e.target.value })} className="display text-[5.8vw] md:text-[2.6vw] leading-[1.06] text-ink bg-transparent border-0 outline-none w-full" />
              {titles.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{titles.map((t) => <button key={t.id} onClick={() => { patch({ title: t.text }, `Title: ${t.text}`); dispatch({ type: "choice", text: `title:${t.text}` }); }} className={cn("chip", project.title === t.text && "active")}>{t.text}</button>)}</div>}
              <div className="prose-cine mt-12">
                {project.story.paragraphs.map((p, i) => (
                  <div key={i} className={cn("relative group/p", paraBusy === i && "animate-pulse")}>
                    {editPara === i ? (
                      <textarea autoFocus value={p} onChange={(e) => patch({ story: { ...project.story!, paragraphs: project.story!.paragraphs.map((x, j) => (j === i ? e.target.value : x)) } })} onBlur={() => { setEditPara(null); patch({}, `Edited paragraph ${i + 1}`); }} className="input serif text-[1.22rem] md:text-[1.32rem] leading-[1.75] h-48 resize-none mb-6" />
                    ) : (
                      <p onClick={() => setEditPara(i)} className="cursor-text hover:bg-bg-2/60 -mx-2 px-2 transition-colors">{p}</p>
                    )}
                    <div className="absolute -right-2 lg:-right-44 top-0 lg:w-40 flex lg:flex-col gap-2 label-sm text-ink-3 opacity-0 group-hover/p:opacity-100 transition-opacity">
                      {[["shorten", "Shorten"], ["expand", "Expand"], ["darker", "Darker"], ["emotional", "More emotional"], ["surprise", "Surprise me"]].map(([m, l]) => <button key={m} onClick={() => rewritePara(i, m)} className="hover:text-accent text-left">{l}</button>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-8">
                <div className="card-edit p-6">
                  <div className="label-sm text-ink-3 mb-2">Ready?</div>
                  <div className="display text-xl text-ink">Publish this story</div>
                  <p className="serif italic text-ink-2 mt-2 text-sm">Readers will respond to the actual paragraphs. Their signal becomes screenability.</p>
                  <button onClick={() => go("publish")} className="btn btn-primary w-full justify-center mt-5">Publish story</button>
                </div>
                <div className="flex flex-col gap-3 label-sm">
                  <button onClick={() => { go("structure"); setTab("dev"); }} className="text-ink-3 hover:text-ink text-left">← Back to development</button>
                  <button onClick={() => { go("structure"); setTab("versions"); }} className="text-ink-3 hover:text-ink text-left">Version history ({project.versions.length})</button>
                  <button onClick={() => { patch({ story: undefined }, "Recompose"); go("compose"); }} className="text-ink-3 hover:text-ink text-left">Compose again</button>
                  <button onClick={() => setPartnerOpen(true)} className="text-accent text-left">Ask the Story Partner</button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      )}

      {/* ------------------------------------------------ PUBLISH */}
      {step === "publish" && (
        <section className="px-6 md:px-14 pt-14 pb-24">
          <div className="label text-accent mb-4">Publish</div>
          <h2 className="display text-[5.8vw] md:text-[2.6vw] leading-[1.06] text-ink mb-12">Give it a cover and a door.</h2>
          <PublishFlow onPublished={() => {}} />
        </section>
      )}

      {/* ------------------------------------------------ PUBLISHED */}
      {step === "published" && project.publish && (
        <section className="relative min-h-[88vh] flex items-center on-image">
          <Still src={project.cover || ""} alt="" deep zoom className="absolute inset-0 rounded-none opacity-60" />
          <div className="relative px-6 md:px-14 w-full grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-8">
              <div className="label text-accent mb-6 anim-in">{project.publish.status === "submitted" ? "Submitted for review" : "Published"} · {project.publish.visibility}</div>
              <h2 className="display text-[6.4vw] md:text-[3.4vw] leading-[1.06] text-ink anim-up d-1">Your story<br />now exists.</h2>
              <p className="serif italic text-ink-2 text-2xl mt-6 max-w-xl anim-up d-3">{project.publish.status === "submitted" ? `${project.title}. The editorial desk reads every public story before it goes live. You'll see it in your dashboard.` : `${project.title}. People can read it. People can discuss it. People will tell you whether they would watch it.`}</p>
              <div className="flex flex-wrap gap-4 mt-10 anim-up d-5">
                {project.publish.storyId && <Link href="/dashboard/stories" className="btn btn-primary">Open in dashboard</Link>}
                <Link href={`/story/${project.publish.slug}`} className={cn("btn", !project.publish.storyId && "btn-primary")}>{project.publish.status === "submitted" ? "Preview as a reader" : "Read it as a reader"}</Link>
                <button onClick={() => router.push("/cinema/develop")} className="btn">Turn this story into cinema</button>
                <Link href="/home" className="btn btn-ghost">Go home</Link>
              </div>
            </div>
            <div className="md:col-span-4 anim-up d-4">
              <div className="card-edit p-6">
                <div className="label-sm text-ink-3 mb-4">What happens next</div>
                <ol className="space-y-3 serif text-ink">
                  <li><span className="numeral text-accent mr-3">01</span>Readers arrive. Comments attach to paragraphs.</li>
                  <li><span className="numeral text-accent mr-3">02</span>They answer: would you watch this as a film?</li>
                  <li><span className="numeral text-accent mr-3">03</span>Screenability appears. It is a community signal, not a prediction.</li>
                  <li><span className="numeral text-accent mr-3">04</span>Turn it into cinema: treatment, cast, visual language, storyboard.</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      )}

      {step === "cinema" && (
        <section className="px-6 md:px-14 py-40 text-center"><div className="display text-xl text-ink">This story is in cinema development.</div><Link href="/cinema/develop" className="btn btn-primary mt-8">Open the film workspace</Link></section>
      )}
    </div>
  );
}
