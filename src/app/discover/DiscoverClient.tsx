"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GENRES, FORMATS, MOODS } from "@/lib/data";
import type { Story } from "@/lib/types";
import { StoryCard } from "@/components/story/StoryCard";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "foryou", label: "For you" }, { key: "trending", label: "Trending" }, { key: "new", label: "New" },
  { key: "loved", label: "Most loved" }, { key: "discussed", label: "Most discussed" }, { key: "screenable", label: "Most screenable" }, { key: "staff", label: "Staff picks" },
];
const LENGTHS = [["Under 15 min", 0, 15], ["15–45 min", 15, 45], ["45 min +", 45, 9999]] as const;
const POTENTIAL = [["Any", 0], ["80%+", 80], ["90%+", 90]] as const;

export function DiscoverClient({ stories }: { stories: Story[] }) {
  const sp = useSearchParams();
  const [tab, setTab] = useState(sp.get("tab") || "foryou");
  const [genre, setGenre] = useState<string | null>(sp.get("genre"));
  const [format, setFormat] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [len, setLen] = useState<number>(-1);
  const [pot, setPot] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(!!sp.get("genre"));

  const list = useMemo(() => {
    let l = [...stories];
    if (genre) l = l.filter((s) => s.genre === genre);
    if (format) l = l.filter((s) => s.format === format);
    if (mood) l = l.filter((s) => s.mood === mood);
    if (len >= 0) { const [, a, b] = LENGTHS[len]; l = l.filter((s) => s.readingTime >= a && s.readingTime < b); }
    if (pot > 0) l = l.filter((s) => s.screenability >= pot);
    switch (tab) {
      case "trending": l.sort((a, b) => (b.stats.readers / (Date.now() - new Date(b.publishedAt).getTime())) - (a.stats.readers / (Date.now() - new Date(a.publishedAt).getTime()))); break;
      case "new": l.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()); break;
      case "loved": l.sort((a, b) => b.stats.likes - a.stats.likes); break;
      case "discussed": l.sort((a, b) => b.stats.comments - a.stats.comments); break;
      case "screenable": l.sort((a, b) => b.screenability - a.screenability); break;
      case "staff": l = l.filter((s) => s.staffPick); break;
      default: l.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.screenability - a.screenability);
    }
    return l;
  }, [tab, genre, format, mood, len, pot, stories]);

  const activeCount = [genre, format, mood].filter(Boolean).length + (len >= 0 ? 1 : 0) + (pot > 0 ? 1 : 0);

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between gap-6 rule pt-5 overflow-x-auto hide-scroll">
        <div className="flex gap-7 shrink-0">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={cn("label link-line py-2 transition-colors whitespace-nowrap", tab === t.key ? "text-ink active" : "text-ink-3 hover:text-ink")}>{t.label}</button>
          ))}
        </div>
        <button onClick={() => setShowFilters((f) => !f)} className="label text-ink-2 hover:text-ink shrink-0 flex items-center gap-2">
          Filters {activeCount > 0 && <span className="text-accent">({activeCount})</span>} <span aria-hidden>{showFilters ? "−" : "+"}</span>
        </button>
      </div>

      {showFilters && (
        <div className="rule mt-5 pt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8 anim-up">
          <Filter label="Genre" options={GENRES as unknown as string[]} value={genre} onChange={setGenre} />
          <Filter label="Format" options={FORMATS as unknown as string[]} value={format} onChange={setFormat} />
          <Filter label="Mood" options={MOODS as unknown as string[]} value={mood} onChange={setMood} />
          <div>
            <div className="label-sm text-ink-3 mb-3">Length</div>
            <div className="flex flex-wrap gap-2">{LENGTHS.map((l, i) => <button key={l[0]} onClick={() => setLen(len === i ? -1 : i)} className={cn("chip", len === i && "active")}>{l[0]}</button>)}</div>
          </div>
          <div>
            <div className="label-sm text-ink-3 mb-3">Cinema potential</div>
            <div className="flex flex-wrap gap-2">{POTENTIAL.map((p) => <button key={p[0]} onClick={() => setPot(p[1])} className={cn("chip", pot === p[1] && "active")}>{p[0]}</button>)}</div>
          </div>
          <div>
            <div className="label-sm text-ink-3 mb-3">Language</div>
            <div className="flex flex-wrap gap-2"><span className="chip active">English</span><span className="chip">Español</span><span className="chip">العربية</span><span className="chip">日本語</span></div>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between label-sm text-ink-3">
        <span>{list.length} {list.length === 1 ? "story" : "stories"}</span>
        {activeCount > 0 && <button onClick={() => { setGenre(null); setFormat(null); setMood(null); setLen(-1); setPot(0); }} className="hover:text-ink">Clear filters</button>}
      </div>

      {list.length === 0 ? (
        <div className="py-32 text-center"><p className="serif italic text-2xl text-ink-2">Nothing here yet. Perhaps that story is still in someone's head.</p></div>
      ) : (
        <div className="mt-8">
          {list[0] && <div className="mb-20"><StoryCard story={list[0]} variant="feature" /></div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {list.slice(1).map((s, i) => <div key={s.id} className={cn(i % 5 === 2 && "lg:mt-16")}><StoryCard story={s} variant={i % 4 === 3 ? "tall" : "poster"} /></div>)}
          </div>
        </div>
      )}
    </div>
  );
}

function Filter({ label, options, value, onChange }: { label: string; options: string[]; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div>
      <div className="label-sm text-ink-3 mb-3">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => <button key={o} onClick={() => onChange(value === o ? null : o)} className={cn("chip", value === o && "active")}>{o}</button>)}
      </div>
    </div>
  );
}
