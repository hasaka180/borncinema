import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "../categories";
import { stories, authorById } from "@/lib/data";
import { StoryCard } from "@/components/story/StoryCard";
import { Still } from "@/components/ui/Still";
import { Reveal } from "@/components/ui/Reveal";

export function generateStaticParams() { return CATEGORIES.map((c) => ({ category: c.slug })); }

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = CATEGORIES.find((c) => c.slug === params.category);
  if (!cat) notFound();
  const list = stories.filter(cat.filter);
  const lead = list[0];

  return (
    <div>
      <div className="relative min-h-[60vh] flex items-end on-image">
        <Still src={cat.image} alt="" deep zoom className="absolute inset-0 rounded-none" />
        <div className="relative px-6 md:px-14 pb-12 md:pb-16 pt-32">
          <div className="flex gap-6 label text-ink-3 mb-6">{CATEGORIES.map((c) => <Link key={c.slug} href={`/stories/${c.slug}`} className={c.slug === cat.slug ? "text-accent" : "hover:text-ink"}>{c.label}</Link>)}</div>
          <h1 className="display text-[7vw] md:text-[4vw] leading-[1.06] text-ink">{cat.label}</h1>
          <p className="serif italic text-ink-2 text-lg md:text-xl mt-4 max-w-xl">{cat.tagline}</p>
        </div>
      </div>

      <div className="px-6 md:px-14 mt-16 md:mt-24">
        {cat.emphasis === "cinema" && lead && (
          <Reveal className="grid md:grid-cols-12 gap-10 items-center">
            <div className="md:col-span-5"><StoryCard story={lead} variant="poster" priority /></div>
            <div className="md:col-span-7 md:pl-10">
              <div className="label text-accent mb-4">Cinematic potential</div>
              <div className="numeral text-[10vw] md:text-[5vw] leading-none text-ink">{lead.screenability}%</div>
              <p className="serif text-2xl text-ink-2 max-w-lg mt-2">of readers said they would watch <span className="text-ink">{lead.title}</span> as a film. Short stories are the platform's most adapted format.</p>
            </div>
          </Reveal>
        )}
        {cat.emphasis === "chapters" && lead && (
          <Reveal className="grid md:grid-cols-12 gap-10">
            <div className="md:col-span-7"><StoryCard story={lead} variant="feature" priority /></div>
            <div className="md:col-span-5 md:pl-6 mt-10 md:mt-0">
              <div className="label text-accent mb-4">Chapters</div>
              {lead.chapters.map((c, i) => (
                <Link key={c.id} href={`/story/${lead.slug}#chapter-${i + 1}`} className="flex items-baseline gap-5 py-4 rule hover:text-accent transition-colors">
                  <span className="numeral text-3xl text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display text-xl">{c.title}</span>
                  <span className="ml-auto label-sm text-ink-3">{c.paragraphs.length} ¶</span>
                </Link>
              ))}
              <div className="label-sm text-ink-3 mt-6">Worldbuilding: {lead.tags.join(" · ")}</div>
            </div>
          </Reveal>
        )}
        {cat.emphasis === "type" && lead && (
          <Reveal className="max-w-3xl mx-auto text-center">
            <div className="label text-accent mb-8">From {lead.title}</div>
            <p className="serif text-xl md:text-2xl leading-tight whitespace-pre-line text-ink">{lead.chapters[0].paragraphs[2]}</p>
            <div className="label-sm text-ink-3 mt-8">{authorById(lead.authorId).name} · <Link href={`/story/${lead.slug}`} className="text-accent">Read the sequence</Link></div>
          </Reveal>
        )}
        {cat.emphasis === "real" && lead && (
          <Reveal>
            <div className="label text-accent mb-4">Reported</div>
            <p className="serif text-xl md:text-2xl leading-tight max-w-4xl text-ink">“{lead.chapters[0].paragraphs[0]}”</p>
            <div className="label-sm text-ink-3 mt-6">{authorById(lead.authorId).name}, <em>{lead.title}</em></div>
          </Reveal>
        )}
        {(cat.emphasis === "worlds" || cat.emphasis === "ideas") && lead && <Reveal><StoryCard story={lead} variant="feature" priority /></Reveal>}

        <div className="mt-24 rule pt-6">
          <div className="label text-ink-3 mb-8">All {cat.label.toLowerCase()}</div>
          {list.length === 0 ? (
            <p className="serif italic text-2xl text-ink-2 py-20">Nothing published here yet. <Link href="/create" className="text-accent">Be the first.</Link></p>
          ) : cat.emphasis === "type" ? (
            <div className="grid md:grid-cols-2 gap-16">{list.map((s) => <StoryCard key={s.id} story={s} variant="minimal" />)}</div>
          ) : (
            <div>{list.map((s, i) => <StoryCard key={s.id} story={s} variant="wide" index={i} />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
