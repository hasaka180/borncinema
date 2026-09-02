"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { stories, authors, films, GENRES } from "@/lib/data";
import { StoryCard } from "@/components/story/StoryCard";
import { Still } from "@/components/ui/Still";

const SUGGEST = ["psychological sci-fi set in Dubai", "arctic", "a story about a door", "one location, one night", "sisters", "1979"];

export default function SearchPage() {
  const [q, setQ] = useState("");
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 2 && !["the", "and", "set", "about", "with"].includes(t));
  const score = (hay: string) => terms.reduce((a, t) => a + (hay.includes(t) ? 1 : 0), 0);

  const res = useMemo(() => {
    if (!terms.length) return { stories: [], authors: [], films: [], genres: [], characters: [], locations: [] };
    const s = stories.map((x) => ({ x, sc: score(`${x.title} ${x.genre} ${x.subgenre} ${x.synopsis} ${x.hook} ${x.tags.join(" ")} ${x.chapters.map((c) => c.paragraphs.join(" ")).join(" ")}`.toLowerCase()) })).filter((r) => r.sc > 0).sort((a, b) => b.sc - a.sc).map((r) => r.x);
    const a = authors.filter((x) => score(`${x.name} ${x.bio} ${x.role} ${x.location} ${x.creativeDNA.genres.join(" ")} ${x.creativeDNA.themes.join(" ")}`.toLowerCase()) > 0);
    const f = films.filter((x) => score(`${x.title} ${x.logline} ${x.visualStyle} ${x.directorVision}`.toLowerCase()) > 0);
    const g = GENRES.filter((x) => score(x.toLowerCase()) > 0);
    const chars = [["Lena", "the-last-elevator"], ["Nour", "the-city-that-forgot-tomorrow"], ["Solveig", "seven-minutes-before-dawn"], ["Adaeze", "a-letter-from-2049"], ["Kasper", "the-projectionist"], ["Wren", "the-cartographer-of-lost-streets"], ["Salcedo", "nobody-lies-in-verano"], ["Jonas", "the-last-person-who-remembered-me"]].filter(([n]) => score(n.toLowerCase()) > 0);
    const locs = [["Königsplatz station", "the-last-elevator"], ["Old Dubai", "the-city-that-forgot-tomorrow"], ["Tromsø", "seven-minutes-before-dawn"], ["Lagos", "a-letter-from-2049"], ["Fetter Court, London", "the-cartographer-of-lost-streets"], ["Verano", "nobody-lies-in-verano"], ["The Rialto", "the-projectionist"]].filter(([n]) => score(n.toLowerCase()) > 0);
    return { stories: s, authors: a, films: f, genres: g, characters: chars, locations: locs };
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = res.stories.length + res.authors.length + res.films.length + res.genres.length + res.characters.length + res.locations.length;

  return (
    <div className="px-6 md:px-14 pt-10 md:pt-16">
      <div className="label text-accent mb-5">Search</div>
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="psychological sci-fi set in Dubai" className="textarea-cine !text-4xl md:!text-6xl w-full display placeholder:normal-case" style={{ fontFamily: "var(--font-display)", textTransform: "uppercase" }} />
      <div className="rule mt-4 pt-4 flex flex-wrap gap-2">{SUGGEST.map((s) => <button key={s} onClick={() => setQ(s)} className="chip">{s}</button>)}</div>

      {terms.length > 0 && (
        <div className="mt-12">
          <div className="label-sm text-ink-3 mb-8">{total} results across stories, authors, characters, locations, genres and film projects</div>
          {res.stories.length > 0 && <section className="mb-16"><div className="label text-accent mb-4">Stories</div>{res.stories.map((s, i) => <StoryCard key={s.id} story={s} variant="wide" index={i} />)}</section>}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {res.characters.length > 0 && <section><div className="label text-accent mb-4">Characters</div>{res.characters.map(([n, slug]) => <Link key={n} href={`/story/${slug}`} className="block py-2 rule display text-xl hover:text-accent">{n}</Link>)}</section>}
            {res.locations.length > 0 && <section><div className="label text-accent mb-4">Locations</div>{res.locations.map(([n, slug]) => <Link key={n} href={`/story/${slug}`} className="block py-2 rule display text-xl hover:text-accent">{n}</Link>)}</section>}
            {res.authors.length > 0 && <section><div className="label text-accent mb-4">Authors</div>{res.authors.map((a) => <Link key={a.id} href={`/profile/${a.handle}`} className="flex items-center gap-3 py-2 rule group"><span className="h-8 w-8 rounded-full overflow-hidden"><Still src={a.avatar} alt="" className="h-full w-full" /></span><span className="text-sm group-hover:text-accent">{a.name}</span></Link>)}</section>}
            {(res.films.length > 0 || res.genres.length > 0) && <section><div className="label text-accent mb-4">Cinema & genres</div>{res.films.map((f) => <Link key={f.id} href={`/cinema/${f.slug}`} className="block py-2 rule display text-xl hover:text-accent">{f.title}</Link>)}{res.genres.map((g) => <Link key={g} href={`/discover?genre=${g}`} className="block py-2 rule display text-xl hover:text-accent">{g}</Link>)}</section>}
          </div>
          {total === 0 && <p className="serif italic text-2xl text-ink-2 py-20 text-center">Nothing yet. That story might not exist. <Link href="/create" className="text-accent">Write it.</Link></p>}
        </div>
      )}
    </div>
  );
}
