"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Comment, Story } from "@/lib/types";
import { authorById, authorOf, discussions, fanCasts } from "@/lib/data";
import { Still } from "@/components/ui/Still";
import { ScreenabilityMeter, SignalRow } from "./Screenability";
import { screenabilitySignals, computeScreenability } from "@/lib/cinema/screenability";
import { cn, fmt, timeAgo } from "@/lib/utils";

type Vote = "yes" | "maybe" | "no" | null;

export function Reader({ story, comments: initial, isOwn = false, liveStats }: { story: Story; comments: Comment[]; isOwn?: boolean; liveStats?: Story["stats"] }) {
  const author = authorOf(story);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [vote, setVote] = useState<Vote>(null);
  const [progress, setProgress] = useState(0);
  const [openPara, setOpenPara] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>(initial);
  const [draft, setDraft] = useState("");
  const [highlights, setHighlights] = useState<Record<number, string[]>>({});
  const [selTip, setSelTip] = useState<{ x: number; y: number; p: number; text: string } | null>(null);
  const [castOpen, setCastOpen] = useState(false);
  const [castLikes, setCastLikes] = useState<Record<string, number>>({});
  const [shared, setShared] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const stats = liveStats || story.stats;
  const allParas = useMemo(() => story.chapters.flatMap((c, ci) => c.paragraphs.map((p, pi) => ({ p, ci, pi }))), [story]);
  const commentsByPara = useMemo(() => comments.reduce<Record<number, Comment[]>>((acc, c) => { if (c.paragraph) (acc[c.paragraph] ||= []).push(c); return acc; }, {}), [comments]);
  const generalComments = comments.filter((c) => !c.paragraph);
  const related = discussions.filter((d) => d.storyId === story.id);
  const casts = fanCasts.filter((f) => f.storyId === story.id);
  const liveScreen = vote ? Math.min(99, computeScreenability({ ...stats, watchVotes: stats.watchVotes + (vote === "yes" ? 1 : 0), readers: stats.readers + 1 })) : story.screenability;

  useEffect(() => {
    const on = () => {
      const el = textRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.5;
      setProgress(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
    };
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const onSel = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !textRef.current?.contains(sel.anchorNode)) { setSelTip(null); return; }
      const text = sel.toString().trim(); if (text.length < 3) { setSelTip(null); return; }
      const node = sel.anchorNode?.parentElement?.closest("[data-para]") as HTMLElement | null;
      if (!node) return;
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      setSelTip({ x: rect.left + rect.width / 2, y: rect.top + window.scrollY - 44, p: Number(node.dataset.para), text });
    };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  const addComment = (paragraph?: number) => {
    if (!draft.trim()) return;
    setComments((c) => [{ id: `me${Date.now()}`, storyId: story.id, authorId: "a1", paragraph, text: draft.trim(), likes: 0, createdAt: new Date().toISOString() }, ...c]);
    setDraft("");
  };

  const share = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setShared(true); setTimeout(() => setShared(false), 2000); } catch {}
  };

  const renderPara = (text: string, n: number) => {
    const hs = highlights[n] || [];
    if (!hs.length) return text;
    let parts: (string | JSX.Element)[] = [text];
    hs.forEach((h, hi) => {
      parts = parts.flatMap((part) => typeof part !== "string" ? [part] : part.split(h).flatMap((seg, i, arr) => i < arr.length - 1 ? [seg, <mark key={`${hi}-${i}`} className="bg-accent/25 text-ink px-0.5">{h}</mark>] : [seg]));
    });
    return parts;
  };

  return (
    <article className="relative">
      {/* progress */}
      <div className="fixed top-16 md:top-[72px] left-0 right-0 h-px z-40" style={{ background: "var(--line)" }}><div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${progress * 100}%` }} /></div>

      {/* HEADER */}
      <header className="relative min-h-[92vh] flex items-end on-image">
        <Still src={story.cover} alt="" deep zoom priority className="absolute inset-0 rounded-none" />
        <div className="relative w-full px-6 md:px-14 pb-14 md:pb-20 pt-40 grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8">
            <div className="label text-accent mb-5">{story.format} · {story.subgenre || story.genre} · {story.readingTime} min read</div>
            <h1 className="display text-[7vw] md:text-[3.8vw] leading-[1.06] text-ink">{story.title}</h1>
            <div className="flex items-center gap-4 mt-6">
              <Link href={`/profile/${author.handle}`} className="flex items-center gap-3 group">
                <span className="h-9 w-9 rounded-full overflow-hidden border border-line-strong"><Still src={author.avatar} alt="" className="h-full w-full" /></span>
                <span><span className="block text-sm text-ink group-hover:text-accent transition-colors">{author.name}</span><span className="block label-sm text-ink-3 mt-0.5">{author.role}</span></span>
              </Link>
              <button onClick={() => setFollowing((f) => !f)} className={cn("btn btn-sm", following && "btn-primary")}>{following ? "Following" : "Follow"}</button>
            </div>
          </div>
          <div className="md:col-span-4 md:justify-self-end">
            <ScreenabilityMeter value={liveScreen} size="md" />
            <div className="text-xs text-ink-3 mt-2">{fmt(stats.readers)} readers · {fmt(stats.likes)} likes · {fmt(stats.comments)} comments</div>
          </div>
        </div>
      </header>

      {/* SYNOPSIS */}
      <section className="px-6 md:px-14 py-16 md:py-24 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-3 label text-ink-3">Synopsis</div>
        <div className="md:col-span-7">
          <p className="serif text-xl md:text-2xl leading-snug text-ink">{story.synopsis}</p>
          <div className="flex flex-wrap gap-2 mt-8">{story.tags.map((t) => <span key={t} className="chip cursor-default">{t}</span>)}</div>
          <a href="#read" className="btn btn-primary mt-10">Read</a>
        </div>
      </section>

      {/* BODY */}
      <div id="read" ref={bodyRef} className="relative rule">
        {/* sticky actions (desktop) */}
        <aside className={cn("hidden lg:flex flex-col gap-5 fixed left-10 top-1/2 -translate-y-1/2 z-30 transition-opacity duration-700", progress > 0 ? "opacity-100" : "opacity-0 pointer-events-none")}>
          <Action on={() => setLiked((l) => !l)} active={liked} label={liked ? "Liked" : "Like"} icon="♥" count={stats.likes + (liked ? 1 : 0)} />
          <Action on={() => setSaved((s) => !s)} active={saved} label={saved ? "Saved" : "Save"} icon="◈" count={stats.saves + (saved ? 1 : 0)} />
          <Action on={() => { setOpenPara(0); }} label="Comment" icon="✎" count={comments.length} />
          <Action on={share} label={shared ? "Copied" : "Share"} icon="↗" />
          <a href="#stay" className="label-sm text-ink-3 hover:text-accent text-center leading-tight mt-2">Would you<br />watch this?</a>
        </aside>

        <div ref={textRef} className="px-6 md:px-14 py-16 md:py-24 max-w-[720px] mx-auto">
          {story.chapters.map((ch, ci) => (
            <section key={ch.id} id={`chapter-${ci + 1}`} className={cn(ci > 0 && "mt-24 pt-16 rule")}>
              {(story.chapters.length > 1 || story.format === "Novel") && (
                <div className="mb-12 text-center">
                  <div className="label text-accent mb-3">{story.format === "Poetry" ? "Sequence" : "Chapter"} {String(ci + 1).padStart(2, "0")}</div>
                  <h2 className="display text-lg md:text-xl text-ink">{ch.title}</h2>
                </div>
              )}
              <div className={cn("prose-cine", story.format === "Poetry" && "whitespace-pre-line text-center")}>
                {ch.paragraphs.map((p, pi) => {
                  const n = allParas.findIndex((x) => x.ci === ci && x.pi === pi) + 1;
                  const cnt = commentsByPara[n]?.length || 0;
                  return (
                    <div key={pi} className="relative group/p" data-para={n}>
                      <p className={cn(openPara === n && "text-accent/90")}>{renderPara(p, n)}</p>
                      <button
                        onClick={() => setOpenPara(openPara === n ? null : n)}
                        className={cn("absolute -right-10 md:-right-16 top-1 label-sm flex flex-col items-center gap-1 transition-opacity", cnt ? "opacity-70 text-accent" : "opacity-0 group-hover/p:opacity-60 text-ink-3", "hover:!opacity-100")}
                        aria-label={`Comments on paragraph ${n}`}
                      >
                        <span className="text-[10px]">¶{n}</span>
                        {cnt > 0 && <span className="text-[10px]">{cnt}</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* selection tooltip */}
        {selTip && (
          <div className="absolute z-40 -translate-x-1/2 flex gap-px anim-in" style={{ left: selTip.x, top: selTip.y }}>
            <button className="btn btn-sm btn-primary" onClick={() => { setHighlights((h) => ({ ...h, [selTip.p]: [...(h[selTip.p] || []), selTip.text] })); window.getSelection()?.removeAllRanges(); setSelTip(null); }}>Highlight</button>
            <button className="btn btn-sm btn-primary" onClick={() => { setOpenPara(selTip.p); setDraft(`“${selTip.text.slice(0, 60)}${selTip.text.length > 60 ? "…" : ""}” — `); window.getSelection()?.removeAllRanges(); setSelTip(null); }}>Comment</button>
          </div>
        )}

        {/* paragraph thread panel */}
        {openPara !== null && (
          <div className="fixed inset-x-3 bottom-3 lg:inset-y-4 lg:left-auto lg:right-4 lg:w-[420px] z-50 flex flex-col anim-up panel overflow-hidden" style={{ maxHeight: "80vh" }}>
            <div className="flex items-center justify-between px-6 py-4 rule">
              <div><div className="label-sm text-ink-3">{openPara === 0 ? "Story discussion" : `Paragraph ${openPara}`}</div><div className="display text-xl mt-1">{openPara === 0 ? generalComments.length : commentsByPara[openPara]?.length || 0} comments</div></div>
              <button onClick={() => setOpenPara(null)} className="label text-ink-3 hover:text-ink">Close</button>
            </div>
            {openPara > 0 && <p className="px-6 py-4 serif italic text-ink-2 text-sm leading-snug line-clamp-3 rule">“{allParas[openPara - 1]?.p}”</p>}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {(openPara === 0 ? generalComments : commentsByPara[openPara] || []).map((c) => <CommentRow key={c.id} c={c} />)}
              {(openPara === 0 ? generalComments : commentsByPara[openPara] || []).length === 0 && <p className="serif italic text-ink-3">Nobody has said anything about this passage yet.</p>}
            </div>
            <div className="px-6 py-4 rule">
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={openPara === 0 ? "What did this story do to you?" : "What happens here?"} className="input serif text-base h-20 resize-none" />
              <div className="flex justify-end mt-2"><button onClick={() => addComment(openPara === 0 ? undefined : openPara)} className="btn btn-sm btn-primary" disabled={!draft.trim()}>Post</button></div>
            </div>
          </div>
        )}
      </div>

      {/* mobile action bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around px-4 py-3 backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)", borderTop: "1px solid var(--line)" }}>
        <button onClick={() => setLiked((l) => !l)} className={cn("label-sm", liked ? "text-accent" : "text-ink-2")}>♥ {fmt(stats.likes + (liked ? 1 : 0))}</button>
        <button onClick={() => setSaved((s) => !s)} className={cn("label-sm", saved ? "text-accent" : "text-ink-2")}>◈ Save</button>
        <button onClick={() => setOpenPara(0)} className="label-sm text-ink-2">✎ {comments.length}</button>
        <button onClick={share} className="label-sm text-ink-2">↗ {shared ? "Copied" : "Share"}</button>
      </div>

      {/* END: DID THIS STORY STAY WITH YOU? */}
      <section id="stay" className="rule-strong px-6 md:px-14 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="label text-accent mb-6">Did this story stay with you?</div>
          <h2 className="display text-lg md:text-xl text-ink">Would you watch this as a film?</h2>
          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {([["yes", "Yes", "absolutely"], ["maybe", "Maybe", "it depends on who makes it"], ["no", "No", "better as a written story"]] as const).map(([k, t, d]) => (
              <button key={k} onClick={() => setVote(k)} className={cn("p-7 md:p-8 text-left transition-all duration-500 rounded-cine border", vote === k ? "border-transparent" : "border-line hover:border-line-strong")} style={{ background: vote === k ? "var(--text)" : "transparent" }}>
                <div className={cn("display text-xl", vote === k ? "" : "text-ink")} style={{ color: vote === k ? "var(--bg)" : undefined }}>{t}</div>
                <div className={cn("serif italic mt-2", vote === k ? "" : "text-ink-2")} style={{ color: vote === k ? "var(--bg)" : undefined, opacity: vote === k ? 0.7 : 1 }}>— {d}</div>
              </button>
            ))}
          </div>
          {vote && <p className="serif italic text-ink-2 mt-8 anim-up">Thank you. Your answer is part of this story's community signal now.</p>}
        </div>

        <div className="max-w-5xl mx-auto mt-24 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-5">
            <ScreenabilityMeter value={liveScreen} size="lg" />
            <p className="serif text-xl text-ink-2 mt-4">{liveScreen}% of readers said they would watch this as a film.</p>
            <p className="label-sm text-ink-3 mt-4">Community signal, not a prediction.</p>
          </div>
          <div className="md:col-span-7"><SignalRow signals={screenabilitySignals({ ...story, stats })} /></div>
        </div>
      </section>

      {/* DISCUSSIONS + FAN CASTING + ADAPTATIONS */}
      <section className="rule px-6 md:px-14 py-20 grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-5">
          <div className="label text-ink-3 mb-6">Discussions</div>
          {related.length === 0 && <p className="serif italic text-ink-3">Start the first discussion below.</p>}
          {related.map((d) => (
            <Link key={d.id} href="/community" className="block py-5 rule group">
              <div className="display text-xl text-ink group-hover:text-accent transition-colors">{d.question}</div>
              <p className="serif italic text-ink-2 mt-2 text-sm">{d.excerpt}</p>
              <div className="label-sm text-ink-3 mt-3">{d.replies} replies · {timeAgo(d.lastActive)}</div>
            </Link>
          ))}
          <div className="mt-6 flex flex-wrap gap-2">{["Would this work better as a film or series?", "Who would you cast?", "What director would suit this?", "Should the ending stay ambiguous?"].map((q) => <button key={q} onClick={() => { setOpenPara(0); setDraft(q + " "); }} className="chip">{q}</button>)}</div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex items-end justify-between mb-6">
            <div className="label text-ink-3">Fan casting</div>
            <button onClick={() => setCastOpen((o) => !o)} className="btn btn-sm">{castOpen ? "Close" : "Cast this story"}</button>
          </div>
          {castOpen && <CastForm story={story} onDone={() => setCastOpen(false)} />}
          <div className="grid md:grid-cols-2 gap-5">
            {casts.map((c) => {
              const a = authorById(c.authorId);
              const likes = c.likes + (castLikes[c.id] || 0);
              return (
                <div key={c.id} className="card-edit p-6">
                  <div className="label-sm text-ink-3 mb-4">{a.name}'s interpretation</div>
                  <dl className="space-y-3">
                    {[["Director", c.director], ["Lead", c.lead], ["Cinematography", c.cinematography], ["Music", c.music]].map(([k, v]) => (
                      <div key={k}><dt className="label-sm text-accent">{k}</dt><dd className="serif text-lg text-ink leading-snug mt-1">{v}</dd></div>
                    ))}
                  </dl>
                  <p className="serif italic text-ink-2 mt-4 text-sm">“{c.note}”</p>
                  <button onClick={() => setCastLikes((l) => ({ ...l, [c.id]: (l[c.id] || 0) === 0 ? 1 : 0 }))} className={cn("label-sm mt-4", castLikes[c.id] ? "text-accent" : "text-ink-3 hover:text-ink")}>♥ {fmt(likes)}</button>
                </div>
              );
            })}
            {casts.length === 0 && <p className="p-6 serif italic text-ink-3">No fan casts yet. Be the first to imagine it.</p>}
          </div>

          <div className="mt-14 card-edit p-8 md:p-10 grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              <div className="label text-accent mb-3">{isOwn ? "Your story is ready" : "Community adaptation"}</div>
              <div className="display text-lg md:text-xl text-ink">{isOwn ? "Turn this story into cinema" : "Imagine this as a film"}</div>
              <p className="serif italic text-ink-2 mt-3">{isOwn ? "Now let's imagine what it looks like on screen." : `Create your own interpretation — casting, visual style, poster, alternative ending — without changing ${author.name}'s original. Credit stays with the author.`}</p>
              {!isOwn && !story.allowRemixes && <p className="label-sm text-ink-3 mt-3">Remixes are disabled for this story. Adaptations remain personal.</p>}
            </div>
            <div className="md:col-span-4 md:justify-self-end"><Link href={isOwn ? "/cinema/develop" : `/cinema/develop?adapt=${story.slug}`} className="btn btn-primary">{isOwn ? "Turn into cinema" : "Imagine as a film"}</Link></div>
          </div>
        </div>
      </section>
    </article>
  );
}

function Action({ on, active, label, icon, count }: { on: () => void; active?: boolean; label: string; icon: string; count?: number }) {
  return (
    <button onClick={on} className={cn("flex flex-col items-center gap-1 transition-colors", active ? "text-accent" : "text-ink-3 hover:text-ink")} aria-pressed={active} aria-label={label}>
      <span className="text-lg leading-none">{icon}</span>
      <span className="label-sm">{count !== undefined ? fmt(count) : label}</span>
    </button>
  );
}

function CommentRow({ c }: { c: Comment }) {
  const a = authorById(c.authorId);
  const [liked, setLiked] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="h-7 w-7 rounded-full overflow-hidden"><Still src={a.avatar} alt="" className="h-full w-full" /></span>
        <span className="text-sm text-ink">{a.name}</span>
        <span className="label-sm text-ink-3">{timeAgo(c.createdAt)}</span>
      </div>
      <p className="serif text-[1.05rem] leading-snug text-ink mt-2">{c.text}</p>
      <button onClick={() => setLiked((l) => !l)} className={cn("label-sm mt-2", liked ? "text-accent" : "text-ink-3 hover:text-ink")}>♥ {c.likes + (liked ? 1 : 0)}</button>
    </div>
  );
}

function CastForm({ story, onDone }: { story: Story; onDone: () => void }) {
  const [f, setF] = useState({ director: "", lead: "", cinematography: "", music: "" });
  const [done, setDone] = useState(false);
  if (done) return <div className="card-edit p-6 mb-6 anim-up"><div className="display text-xl text-ink">Your cast for {story.title} exists.</div><p className="serif italic text-ink-2 mt-2">It is a community interpretation. The original stays with the author.</p><button onClick={onDone} className="btn btn-sm mt-4">Close</button></div>;
  return (
    <div className="card-edit p-6 mb-6 anim-up grid sm:grid-cols-2 gap-x-8 gap-y-5">
      {(["director", "lead", "cinematography", "music"] as const).map((k) => (
        <label key={k} className="block"><span className="label-sm text-ink-3">{k}</span><input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="input text-base" placeholder={k === "director" ? "A director who…" : k === "lead" ? "An actor who…" : k === "cinematography" ? "A style" : "A sound"} /></label>
      ))}
      <div className="sm:col-span-2 flex justify-end gap-3"><button onClick={onDone} className="btn btn-sm">Cancel</button><button onClick={() => setDone(true)} className="btn btn-sm btn-primary" disabled={!f.director && !f.lead}>Add my cast</button></div>
    </div>
  );
}
