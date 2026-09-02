import Link from "next/link";
import { notFound } from "next/navigation";
import { films, filmBySlug, storyById, authorById, FILM_STAGES, fanCasts } from "@/lib/data";
import { Still } from "@/components/ui/Still";
import { Reveal } from "@/components/ui/Reveal";
import { ScreenabilityMeter, SignalRow } from "@/components/story/Screenability";
import { screenabilitySignals } from "@/lib/cinema/screenability";
import { pad } from "@/lib/utils";
import { PreviewPlayer } from "@/components/cinema/PreviewPlayer";

export function generateStaticParams() { return films.map((f) => ({ slug: f.slug })); }

export default function FilmPage({ params }: { params: { slug: string } }) {
  const film = filmBySlug(params.slug);
  if (!film) notFound();
  const story = storyById(film.storyId)!;
  const author = authorById(story.authorId);
  const casts = fanCasts.filter((c) => c.storyId === story.id);

  return (
    <div>
      <section className="relative min-h-[90vh] grid md:grid-cols-12">
        <div className="md:col-span-7 relative min-h-[50vh] on-image"><Still src={film.poster} alt="" vignette zoom priority className="absolute inset-0 rounded-none" /></div>
        <div className="md:col-span-5 p-6 md:p-12 flex flex-col justify-end">
          <div className="label text-accent mb-5">Film project · {film.format}</div>
          <h1 className="display text-[6vw] md:text-[2.7vw] leading-[1.06] text-ink">{film.title}</h1>
          <p className="serif italic text-ink-2 text-lg mt-5">{film.logline}</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 mt-8 rule pt-6">
            {[["Genre", film.genre], ["Runtime", film.runtime], ["Visual style", film.visualStyle], ["From", `${story.title}`], ["Creator", author.name], ["Anticipation", `${film.anticipation}%`]].map(([k, v]) => (
              <div key={k}><dt className="label-sm text-ink-3">{k}</dt><dd className="text-sm text-ink mt-1">{v}</dd></div>
            ))}
          </dl>
          <div className="flex gap-3 mt-8"><Link href={`/story/${story.slug}`} className="btn">Read the story</Link><Link href="/cinema/develop" className="btn btn-primary">Open a workspace like this</Link></div>
        </div>
      </section>

      <section className="px-6 md:px-14 py-16 rule">
        <div className="label text-ink-3 mb-8">Development stages</div>
        <ol className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {FILM_STAGES.map((s) => (
            <li key={s.n} className="p-5 min-h-[140px] flex flex-col justify-between rounded-cine-sm border border-line" style={{ background: s.n <= film.stage ? "var(--surface)" : "transparent" }}>
              <span className={`numeral text-3xl ${s.n <= film.stage ? "text-accent" : "text-ink-3"}`}>{pad(s.n)}</span>
              <span><span className="display text-xl text-ink block">{s.label}</span><span className="label-sm text-ink-3 mt-1 block">{s.n < film.stage ? "Complete" : s.n === film.stage ? "In progress" : "Not started"}</span></span>
            </li>
          ))}
        </ol>
      </section>

      <section className="px-6 md:px-14 py-16 grid md:grid-cols-12 gap-12">
        <Reveal className="md:col-span-5">
          <div className="label text-accent mb-4">Director vision</div>
          <p className="serif text-xl md:text-2xl leading-snug text-ink">{film.directorVision}</p>
          <div className="mt-10 label text-accent mb-3">Palette</div>
          <div className="flex h-14 rounded-cine-sm overflow-hidden">{film.palette.map((c) => <span key={c} className="flex-1" style={{ background: c }} />)}</div>
        </Reveal>
        <Reveal delay={100} className="md:col-span-7">
          <div className="label text-accent mb-4">Visual references</div>
          <div className="grid grid-cols-2 gap-2">
            {film.frames.map((f, i) => <Still key={i} src={f} alt="" vignette className={i === 0 ? "col-span-2 aspect-[21/9]" : "aspect-video"} />)}
          </div>
        </Reveal>
      </section>

      <section className="px-6 md:px-14 py-16 rule">
        <div className="label text-accent mb-4">Cinematic preview</div>
        <p className="serif italic text-ink-2 mb-8 max-w-xl">Placeholder preview built from storyboard frames and camera motion. Real video generation connects through the AI_VIDEO_PROVIDER interface.</p>
        <PreviewPlayer frames={film.frames} title={film.title} captions={[film.logline, film.directorVision, `${story.title} · ${author.name}`]} palette={film.palette} />
      </section>

      <section className="px-6 md:px-14 py-16 rule grid md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5"><ScreenabilityMeter value={story.screenability} size="lg" /><p className="serif text-xl text-ink-2 mt-4">{story.screenability}% of readers said they would watch this as a film.</p></div>
        <div className="md:col-span-7"><SignalRow signals={screenabilitySignals(story)} /></div>
      </section>

      {casts.length > 0 && (
        <section className="px-6 md:px-14 py-16 rule">
          <div className="label text-ink-3 mb-8">Fan casting for this project</div>
          <div className="grid md:grid-cols-2 gap-6">
            {casts.map((c) => (
              <div key={c.id} className="card-edit p-7">
                <div className="label-sm text-ink-3 mb-4">{authorById(c.authorId).name}</div>
                {[["Director", c.director], ["Lead", c.lead], ["Cinematography", c.cinematography], ["Music", c.music]].map(([k, v]) => <div key={k} className="mt-3"><div className="label-sm text-accent">{k}</div><div className="serif text-lg text-ink mt-1">{v}</div></div>)}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
