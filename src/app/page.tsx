import Link from "next/link";
import { TunnelHero } from "@/components/hero/TunnelHero";
import { HowItWorks } from "@/components/hero/HowItWorks";
import { IntroVeil } from "@/components/hero/IntroVeil";
import { StoryCard } from "@/components/story/StoryCard";
import { StoryRail } from "@/components/story/StoryRail";
import { SectionHead } from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";
import { Still } from "@/components/ui/Still";
import { Counter } from "@/components/ui/Counter";
import { stories as demoStories, GENRES, authorById } from "@/lib/data";
import { getPublicStories } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";

const stories = demoStories;
const byScreen = [...stories].sort((a, b) => b.screenability - a.screenability);
const byLoved = [...stories].sort((a, b) => b.stats.likes - a.stats.likes);
const byTalk = [...stories].sort((a, b) => b.stats.comments - a.stats.comments);
const trending = [...stories].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());


export default async function Home() {
  const all = await getPublicStories();
  const newVoices = all.filter((s) => s.newVoice || (s.authorId.startsWith("a") && authorById(s.authorId).followers < 10000));
  const lead = stories[0];
  const second = stories[4];
  const third = stories[2];

  return (
    <>
      <IntroVeil />
      <TunnelHero />

      {/* STORIES WAITING FOR CINEMA */}
      <section className="px-6 md:px-14 pt-16 md:pt-28">
        <Reveal><SectionHead eyebrow="Community signal" title="Stories waiting for cinema" sub="Readers already know which of these they would watch." href="/discover?tab=screenable" hrefLabel="All screenable stories" /></Reveal>
        <Reveal className="mt-14 md:mt-20"><StoryCard story={lead} variant="feature" priority /></Reveal>

        <div className="grid md:grid-cols-12 gap-8 md:gap-12 mt-28 md:mt-36">
          <Reveal className="md:col-span-4"><StoryCard story={second} variant="poster" /></Reveal>
          <Reveal className="md:col-span-3 md:mt-20" delay={120}><StoryCard story={third} variant="poster" /></Reveal>
          <Reveal className="md:col-span-4 md:col-start-9 md:mt-40" delay={240}>
            <div className="rule pt-6">
              <div className="label text-ink-3 mb-6">Most screenable this week</div>
              {byScreen.slice(0, 5).map((s, i) => <StoryCard key={s.id} story={s} variant="row" index={i} />)}
            </div>
          </Reveal>
        </div>
      </section>

      {/* DISCOVER WHAT PEOPLE ARE IMAGINING */}
      <section className="mt-32 md:mt-44 px-6 md:px-14">
        <Reveal><SectionHead eyebrow="Genres" title="Discover what people are imagining" size="md" href="/discover" /></Reveal>
        <Reveal className="mt-12">
          <div className="flex flex-wrap gap-3">
            {GENRES.map((g) => {
              const count = stories.filter((s) => s.genre === g).length;
              return (
                <Link key={g} href={`/discover?genre=${encodeURIComponent(g)}`} className="group inline-flex items-baseline gap-3 rounded-full border border-line px-5 py-3 hover:border-accent transition-colors">
                  <span className="display text-lg md:text-xl text-ink group-hover:text-accent transition-colors">{g}</span>
                  <span className="label-sm text-ink-3">{count || "·"}</span>
                </Link>
              );
            })}
          </div>
        </Reveal>
      </section>

      <HowItWorks />

      {/* TRENDING RAIL */}
      <section className="mt-32 md:mt-44 px-6 md:px-14">
        <Reveal><SectionHead eyebrow="Right now" title="Trending stories" size="md" href="/discover?tab=trending" /></Reveal>
        <div className="mt-20"><StoryRail stories={trending} /></div>
      </section>

      {/* MOST LOVED / MOST DISCUSSED */}
      <section className="mt-32 md:mt-44 px-6 md:px-14 grid lg:grid-cols-2 gap-16 lg:gap-24">
        <Reveal>
          <SectionHead eyebrow="Readers" title="Most loved" size="md" href="/discover?tab=loved" />
          <div className="mt-8">{byLoved.slice(0, 4).map((s, i) => <StoryCard key={s.id} story={s} variant="wide" index={i} />)}</div>
        </Reveal>
        <Reveal delay={120}>
          <SectionHead eyebrow="Conversation" title="Most discussed" size="md" href="/discover?tab=discussed" />
          <div className="mt-8">{byTalk.slice(0, 4).map((s, i) => <StoryCard key={s.id} story={s} variant="wide" index={i} />)}</div>
        </Reveal>
      </section>

      {/* MOST SCREENABLE — full-bleed */}
      <section className="mt-32 md:mt-44 relative on-image mx-6 md:mx-14 rounded-cine overflow-hidden">
        <Still src={byScreen[1].stills[0]} alt="" deep zoom className="absolute inset-0 rounded-none" />
        <div className="relative px-8 md:px-14 py-20 md:py-32 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-7">
            <div className="label text-accent mb-6">Most screenable</div>
            <h2 className="display text-[6.4vw] md:text-[3.4vw] leading-[1.06] text-ink">{byScreen[1].title}</h2>
            <p className="serif italic text-ink-2 text-lg md:text-xl mt-6 max-w-xl">“{byScreen[1].hook}”</p>
            <Link href={`/story/${byScreen[1].slug}`} className="btn btn-primary mt-8">Read story</Link>
          </div>
          <div className="md:col-span-5 md:justify-self-end grid grid-cols-3 gap-8">
            <div><div className="numeral text-5xl text-accent"><Counter to={byScreen[1].screenability} suffix="%" format={false} /></div><div className="label-sm text-ink-3 mt-2">Would watch</div></div>
            <div><div className="numeral text-5xl text-ink"><Counter to={byScreen[1].stats.readers} /></div><div className="label-sm text-ink-3 mt-2">Readers</div></div>
            <div><div className="numeral text-5xl text-ink"><Counter to={byScreen[1].stats.watchVotes} /></div><div className="label-sm text-ink-3 mt-2">Watch votes</div></div>
          </div>
        </div>
      </section>

      {/* NEW VOICES */}
      <section className="mt-32 md:mt-44 px-6 md:px-14">
        <Reveal><SectionHead eyebrow="First stories" title="New voices" sub="Someone who has never written a screenplay. Someone with an idea." size="md" href="/discover?tab=new" /></Reveal>
        <div className="grid md:grid-cols-3 gap-10 md:gap-14 mt-14">
          {newVoices.slice(0, 3).map((s, i) => <Reveal key={s.id} delay={i * 100}><StoryCard story={s} variant="minimal" /></Reveal>)}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="mt-32 md:mt-48 px-6 md:px-14">
        <Reveal className="rule-strong pt-16 md:pt-24 text-center">
          <p className="serif italic text-ink-2 text-2xl md:text-3xl">Your next favorite film may not exist yet.</p>
          <h2 className="display text-[7vw] md:text-[3.8vw] leading-[1.06] text-ink mt-6">Bring your<br />idea to life</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/create" className="btn btn-primary">Start an idea</Link>
            <Link href="/signup" className="btn">Become a creator</Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
