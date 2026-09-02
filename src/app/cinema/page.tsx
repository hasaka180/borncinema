import Link from "next/link";
import { films, stories, storyById, authorById, fanCasts, FILM_STAGES } from "@/lib/data";
import { Still } from "@/components/ui/Still";
import { SectionHead } from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";
import { StoryCard } from "@/components/story/StoryCard";
import { fmt, pad } from "@/lib/utils";

export const metadata = { title: "Cinema — Born Cinema" };

export default function CinemaPage() {
  const anticipated = [...films].sort((a, b) => b.anticipation - a.anticipation);
  const lead = anticipated[0];
  const leadStory = storyById(lead.storyId)!;
  const screenable = [...stories].sort((a, b) => b.screenability - a.screenability);
  const favorites = [...stories].sort((a, b) => b.stats.watchVotes - a.stats.watchVotes);
  const recent = films.filter((f) => f.stage >= 6);

  return (
    <div>
      <section className="relative min-h-[92vh] flex items-end on-image">
        <Still src={lead.poster} alt="" deep zoom priority className="absolute inset-0 rounded-none" />
        <div className="relative px-6 md:px-14 pb-16 pt-40 grid md:grid-cols-12 gap-8 items-end w-full">
          <div className="md:col-span-8">
            <div className="label text-accent mb-5">Most anticipated · {lead.format} · Stage {pad(lead.stage)} of 08</div>
            <h1 className="display text-[7vw] md:text-[3.8vw] leading-[1.06] text-ink">{lead.title}</h1>
            <p className="serif italic text-ink-2 text-lg md:text-xl mt-6 max-w-2xl">{lead.logline}</p>
            <div className="flex gap-4 mt-8"><Link href={`/cinema/${lead.slug}`} className="btn btn-primary">Open film project</Link><Link href={`/story/${leadStory.slug}`} className="btn">Read the story</Link></div>
          </div>
          <div className="md:col-span-4 md:justify-self-end text-right">
            <div className="numeral text-5xl text-accent">{lead.anticipation}%</div>
            <div className="label-sm text-ink-3 mt-1">anticipation</div>
            <div className="text-xs text-ink-2 mt-4">From <em>{leadStory.title}</em> by {authorById(leadStory.authorId).name}</div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-14 pt-20 md:pt-28">
        <Reveal><SectionHead eyebrow="Film projects" title="Stories in development" sub="A filmmaker can discover an unknown story here." /></Reveal>
        <div className="mt-14 grid md:grid-cols-2 gap-6">
          {films.map((f, i) => {
            const st = storyById(f.storyId)!;
            return (
              <Reveal key={f.id} delay={i * 60}>
                <Link href={`/cinema/${f.slug}`} className="group card-edit grid grid-cols-12 gap-6 p-6 md:p-7 h-full">
                  <div className="col-span-5"><Still src={f.poster} alt="" vignette className="aspect-[3/4]" /></div>
                  <div className="col-span-7 flex flex-col">
                    <div className="label-sm text-accent">{f.format} · {f.visualStyle}</div>
                    <h3 className="display text-lg md:text-xl text-ink mt-3 group-hover:text-accent transition-colors leading-[1.06]">{f.title}</h3>
                    <p className="serif italic text-ink-2 mt-3 text-[1.05rem] leading-snug line-clamp-3">{f.logline}</p>
                    <div className="mt-auto pt-6">
                      <div className="flex justify-between label-sm text-ink-3 mb-2"><span>Stage {pad(f.stage)} · {FILM_STAGES[f.stage - 1].label}</span><span>{f.runtime}</span></div>
                      <div className="flex gap-px">{FILM_STAGES.map((s) => <span key={s.n} className="h-[3px] flex-1" style={{ background: s.n <= f.stage ? "var(--accent)" : "var(--line)" }} />)}</div>
                      <div className="text-xs text-ink-3 mt-3">{fmt(st.stats.watchVotes)} watch votes · {st.screenability}% screenable</div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="px-6 md:px-14 mt-28 grid lg:grid-cols-2 gap-16">
        <Reveal><SectionHead eyebrow="Community favorites" title="Most wanted on screen" size="md" /><div className="mt-8">{favorites.slice(0, 5).map((s, i) => <StoryCard key={s.id} story={s} variant="row" index={i} />)}</div></Reveal>
        <Reveal delay={100}><SectionHead eyebrow="Screenability" title="Most screenable" size="md" href="/discover?tab=screenable" /><div className="mt-8">{screenable.slice(0, 5).map((s, i) => <StoryCard key={s.id} story={s} variant="row" index={i} />)}</div></Reveal>
      </section>

      <section className="px-6 md:px-14 mt-28">
        <Reveal><SectionHead eyebrow="Recently adapted" title="Furthest along" size="md" /></Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {recent.map((f) => (
            <Link key={f.id} href={`/cinema/${f.slug}`} className="group">
              <div className="grid grid-cols-2 gap-1">{f.frames.slice(0, 4).map((fr, i) => <Still key={i} src={fr} alt="" className="aspect-video" />)}</div>
              <div className="mt-4 flex justify-between items-baseline"><span className="display text-xl text-ink group-hover:text-accent transition-colors">{f.title}</span><span className="label-sm text-ink-3">Stage {pad(f.stage)}</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-14 mt-28">
        <Reveal><SectionHead eyebrow="Fan casting" title="Community interpretations" size="md" href="/community" /></Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {fanCasts.slice(0, 3).map((c) => {
            const st = storyById(c.storyId)!;
            return (
              <div key={c.id} className="card-edit p-7">
                <div className="label-sm text-ink-3">{st.title} · {authorById(c.authorId).name}</div>
                <div className="serif text-xl text-ink mt-4 leading-snug"><span className="label-sm text-accent block mb-1">Director</span>{c.director}</div>
                <div className="serif text-xl text-ink mt-4 leading-snug"><span className="label-sm text-accent block mb-1">Lead</span>{c.lead}</div>
                <div className="label-sm text-ink-3 mt-6">♥ {fmt(c.likes)}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-6 md:px-14 mt-28">
        <Reveal><SectionHead eyebrow="Visual concepts" title="Palettes in development" size="md" /></Reveal>
        <div className="mt-10 grid md:grid-cols-3 gap-10">
          {films.map((f) => (
            <Link key={f.id} href={`/cinema/${f.slug}`} className="group">
              <div className="flex h-16 rounded-cine-sm overflow-hidden">{f.palette.map((c) => <span key={c} className="flex-1 transition-all duration-500 group-hover:first:flex-[2]" style={{ background: c }} />)}</div>
              <div className="flex justify-between mt-3"><span className="label-sm text-ink-2">{f.title}</span><span className="label-sm text-ink-3">{f.visualStyle}</span></div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
