"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useProject } from "@/store/project";
import { GENRES, FORMATS, IMG } from "@/lib/data";
import { Still } from "@/components/ui/Still";
import { cn, slugify } from "@/lib/utils";

const COVERS = [IMG.tunnel, IMG.corridor, IMG.station, IMG.rainWindow, IMG.nightCity, IMG.fogForest, IMG.windowLight, IMG.dubaiNight, IMG.aurora, IMG.ocean, IMG.hotel, IMG.neon];

export function PublishFlow({ onPublished }: { onPublished: () => void }) {
  const { project, patch, go } = useProject();
  const [f, setF] = useState({
    title: project.title || project.story?.title || "",
    cover: project.cover || COVERS[0],
    description: project.story?.synopsis || "",
    genre: project.publish?.genre || guessGenre(project.interpretation?.genre),
    format: project.publish?.format || "Short Story",
    tags: project.publish?.tags?.join(", ") || [project.characters[0]?.name.split(" ")[0], project.locations[0]?.name.split(",")[0], project.interpretation?.mood?.split(",")[0]].filter(Boolean).join(", "),
    rating: "Everyone", language: "English", visibility: (project.publish?.visibility || "public") as "public" | "unlisted" | "private", allowRemixes: true,
  });
  const [stage, setStage] = useState(0);
  const [me, setMe] = useState<{ id: string; name: string } | null | undefined>(undefined);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user || null)).catch(() => setMe(null)); }, []);
  const set = (k: keyof typeof f, v: any) => setF((x) => ({ ...x, [k]: v }));

  const publish = async () => {
    setStage(1); setErr(null);
    const tags = f.tags.split(",").map((t) => t.trim()).filter(Boolean);
    let slug = `${slugify(f.title)}-${project.id.slice(-4)}`;
    let status: "submitted" | "published" | "local" = "local";
    let storyId: string | undefined;
    if (me) {
      const r = await fetch("/api/stories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: f.title, cover: f.cover, hook: project.story?.hook || f.description.slice(0, 120), synopsis: f.description, genre: f.genre, format: f.format, tags, language: f.language, rating: f.rating, visibility: f.visibility, allowRemixes: f.allowRemixes, paragraphs: project.story?.paragraphs || [], action: "submit", project: { structure: project.structure, characters: project.characters, locations: project.locations, idea: project.idea } }) });
      if (r.ok) { const d = await r.json(); slug = d.story.slug; status = d.story.status; storyId = d.story.id; } else { setErr("The story could not be saved to your account. It has been kept locally."); }
    }
    patch({ title: f.title, cover: f.cover, publish: { genre: f.genre, format: f.format, tags, rating: f.rating, language: f.language, visibility: f.visibility, description: f.description, allowRemixes: f.allowRemixes, publishedAt: new Date().toISOString(), slug, status, storyId } }, status === "submitted" ? "Submitted for review" : "Published");
    setTimeout(() => { go("published"); onPublished(); }, 2200);
  };

  if (stage === 1) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-center">
        <div><div className="label text-accent mb-6 anim-in">{f.visibility === "public" && me ? "Sending to the editorial desk" : "Publishing"}</div><div className="display text-lg md:text-xl text-ink anim-up d-2">{f.title}</div><p className="serif italic text-ink-2 mt-6 anim-up d-5">A story is about to exist.</p></div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-12">
      <div className="lg:col-span-7 space-y-10">
        <Field label="Title"><input value={f.title} onChange={(e) => set("title", e.target.value)} className="input !text-3xl display uppercase" style={{ fontFamily: "var(--font-display)" }} /></Field>
        <Field label="Cover">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">{COVERS.map((c) => <button key={c} onClick={() => set("cover", c)} className={cn("aspect-[3/4] border-2 rounded-cine-sm overflow-hidden", f.cover === c ? "border-accent" : "border-transparent")}><Still src={c} alt="" className="h-full w-full" /></button>)}</div>
        </Field>
        <Field label="Description"><textarea value={f.description} onChange={(e) => set("description", e.target.value)} className="input text-lg h-28 resize-none" /></Field>
        <div className="grid sm:grid-cols-2 gap-8">
          <Field label="Genre"><Select value={f.genre} onChange={(v) => set("genre", v)} options={GENRES as unknown as string[]} /></Field>
          <Field label="Format"><Select value={f.format} onChange={(v) => set("format", v)} options={FORMATS as unknown as string[]} /></Field>
          <Field label="Content rating"><Select value={f.rating} onChange={(v) => set("rating", v)} options={["Everyone", "Teen", "Mature"]} /></Field>
          <Field label="Language"><Select value={f.language} onChange={(v) => set("language", v)} options={["English", "Español", "Français", "Deutsch", "العربية", "日本語"]} /></Field>
        </div>
        <Field label="Tags"><input value={f.tags} onChange={(e) => set("tags", e.target.value)} className="input text-base" placeholder="comma, separated" /></Field>
        <Field label="Visibility">
          <div className="grid sm:grid-cols-3 gap-3">
            {([["public", "Public", "Anyone can read, discuss, and vote."], ["unlisted", "Unlisted", "Only people with the link."], ["private", "Private", "Only you."]] as const).map(([k, t, d]) => (
              <button key={k} onClick={() => set("visibility", k)} className="p-5 text-left transition-colors rounded-cine-sm border border-line" style={{ background: f.visibility === k ? "var(--text)" : "transparent", color: f.visibility === k ? "var(--bg)" : "var(--text)" }}>
                <div className="display text-xl">{t}</div><div className="serif italic text-sm mt-1 opacity-70">{d}</div>
              </button>
            ))}
          </div>
        </Field>
        <label className="flex items-center gap-4 cursor-pointer"><input type="checkbox" checked={f.allowRemixes} onChange={(e) => set("allowRemixes", e.target.checked)} className="accent-[var(--accent)]" /><span className="serif text-lg text-ink">Allow remixes</span><span className="label-sm text-ink-3">Others may create adaptations. Attribution is always preserved.</span></label>
      </div>
      <div className="lg:col-span-5">
        <div className="sticky top-28">
          <div className="label text-ink-3 mb-4">Preview</div>
          <Still src={f.cover} alt="" vignette className="aspect-[4/5]">
            <div className="absolute inset-0 z-[2] p-6 flex flex-col justify-end">
              <div className="label-sm text-accent">{f.format} · {f.genre}</div>
              <div className="display text-xl text-ink mt-2 leading-[1.06]">{f.title || "Untitled"}</div>
              <p className="serif italic text-ink-2 text-sm mt-3 line-clamp-3">{f.description}</p>
            </div>
          </Still>
          {me === null && <div className="card-edit p-4 mt-6"><div className="label-sm text-accent mb-1">Sign in to publish</div><p className="serif italic text-ink-2 text-sm">Publishing saves the story to your account and, for public stories, sends it to the editorial desk. <Link href="/signup?next=/create" className="text-accent">Become a creator</Link> or <Link href="/login?next=/create" className="text-accent">sign in</Link> — your draft stays here.</p></div>}
          <button onClick={publish} className="btn btn-primary w-full justify-center mt-6" disabled={!f.title.trim() || me === undefined}>{me ? (f.visibility === "public" ? "Submit for review" : "Publish") : "Publish locally"}</button>
          {err && <p className="serif italic text-accent text-sm mt-3">{err}</p>}
          <p className="label-sm text-ink-3 mt-3 text-center">{f.visibility === "public" ? "Public stories are read by the editorial desk before they go live." : "Unlisted and private stories publish immediately."}</p>
        </div>
      </div>
    </div>
  );
}

function guessGenre(g?: string) {
  const s = (g || "").toLowerCase();
  if (s.includes("sci")) return "Sci-Fi"; if (s.includes("horror")) return "Horror"; if (s.includes("myster")) return "Mystery"; if (s.includes("fantasy")) return "Fantasy"; if (s.includes("comedy")) return "Comedy"; return "Drama";
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><div className="label-sm text-ink-3 mb-3">{label}</div>{children}</div>; }
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="input text-base bg-transparent">{options.map((o) => <option key={o} value={o} style={{ background: "var(--bg)" }}>{o}</option>)}</select>;
}
