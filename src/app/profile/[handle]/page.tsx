import Link from "next/link";
import { notFound } from "next/navigation";
import { authors, authorByHandle, storiesByAuthor, films, stories, IMG } from "@/lib/data";
import { Still } from "@/components/ui/Still";
import { StoryCard } from "@/components/story/StoryCard";
import { fmt, pad } from "@/lib/utils";
import { db } from "@/lib/server/db";
import { toStory } from "@/lib/server/catalog";
import { getSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return authors.map((a) => ({ handle: a.handle })); }

export default async function ProfilePage({ params }: { params: { handle: string } }) {
  const a = authorByHandle(params.handle);
  if (!a) return <MemberProfile handle={params.handle} />;
  const mine = storiesByAuthor(a.id);
  const myFilms = films.filter((f) => mine.some((s) => s.id === f.storyId));
  const mostRead = [...mine].sort((x, y) => y.stats.readers - x.stats.readers)[0];
  const mostLoved = [...mine].sort((x, y) => y.stats.likes - x.stats.likes)[0];
  const mostScreen = [...mine].sort((x, y) => y.screenability - x.screenability)[0];
  const favorites = stories.filter((s) => s.authorId !== a.id).slice(0, 4);

  return (
    <div>
      <section className="relative min-h-[70vh] flex items-end on-image">
        <Still src={mine[0]?.stills[0] || IMG.cinema} alt="" deep zoom className="absolute inset-0 rounded-none opacity-70" />
        <div className="relative px-6 md:px-14 pb-14 pt-40 w-full grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8 flex items-end gap-8">
            <span className="h-24 w-24 md:h-36 md:w-36 rounded-full overflow-hidden border border-line-strong shrink-0"><Still src={a.avatar} alt={a.name} className="h-full w-full" /></span>
            <div>
              <div className="label text-accent mb-3">Creator · {a.location}</div>
              <h1 className="display text-[6.2vw] md:text-[3vw] leading-[1.06] text-ink">{a.name}</h1>
              <div className="text-sm text-ink-2 mt-3">{a.role}</div>
            </div>
          </div>
          <div className="md:col-span-4 md:justify-self-end flex items-center gap-8">
            <div><div className="numeral text-4xl text-ink">{fmt(a.followers)}</div><div className="label-sm text-ink-3 mt-1">Followers</div></div>
            <div><div className="numeral text-4xl text-ink">{mine.length}</div><div className="label-sm text-ink-3 mt-1">Stories</div></div>
            <button className="btn btn-primary">Follow</button>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-14 py-14 grid md:grid-cols-12 gap-10">
        <p className="md:col-span-7 serif text-xl md:text-2xl leading-snug text-ink">{a.bio}</p>
        <div className="md:col-span-5 md:pl-10">
          <div className="label text-accent mb-5">Creative DNA</div>
          <dl className="space-y-4">
            {[["Genres", a.creativeDNA.genres], ["Themes", a.creativeDNA.themes], ["Writing styles", a.creativeDNA.styles], ["Cinematic influences", a.creativeDNA.influences]].map(([k, v]) => (
              <div key={k as string} className="rule pt-3"><dt className="label-sm text-ink-3">{k as string}</dt><dd className="serif text-lg text-ink mt-1">{(v as string[]).join(" · ")}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {mine.length > 0 && (
        <section className="px-6 md:px-14 py-14 rule">
          <div className="grid md:grid-cols-3 gap-8">
            {[["Most read", mostRead, `${fmt(mostRead.stats.readers)} readers`], ["Most loved", mostLoved, `${fmt(mostLoved.stats.likes)} likes`], ["Most screenable", mostScreen, `${mostScreen.screenability}% would watch`]].map(([label, s, meta]) => (
              <Link key={label as string} href={`/story/${(s as any).slug}`} className="group">
                <div className="label text-accent mb-4">{label as string}</div>
                <Still src={(s as any).cover} alt="" className="aspect-[16/10]" />
                <div className="display text-xl text-ink mt-4 group-hover:text-accent transition-colors">{(s as any).title}</div>
                <div className="label-sm text-ink-3 mt-2">{meta as string}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-6 md:px-14 py-14 rule">
        <div className="flex gap-8 label text-ink-3 mb-10"><span className="text-ink">Stories</span><span>Film projects</span><span>Collections</span><span>Favorites</span></div>
        {mine.length ? mine.map((s, i) => <StoryCard key={s.id} story={s} variant="wide" index={i} />) : <p className="serif italic text-ink-3">No stories yet.</p>}
      </section>

      {myFilms.length > 0 && (
        <section className="px-6 md:px-14 py-14 rule">
          <div className="label text-ink-3 mb-8">Film projects</div>
          <div className="grid md:grid-cols-3 gap-8">
            {myFilms.map((f) => (
              <Link key={f.id} href={`/cinema/${f.slug}`} className="group">
                <Still src={f.poster} alt="" vignette className="aspect-[3/4]" />
                <div className="flex justify-between mt-4"><span className="display text-xl text-ink group-hover:text-accent transition-colors">{f.title}</span><span className="label-sm text-ink-3">Stage {pad(f.stage)}</span></div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="px-6 md:px-14 py-14 rule">
        <div className="label text-ink-3 mb-8">Favorites</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">{favorites.map((s) => <StoryCard key={s.id} story={s} variant="tall" />)}</div>
      </section>
    </div>
  );
}

/** A member's cinematic portfolio: what they make, what they have published. */
async function MemberProfile({ handle }: { handle: string }) {
  const u = await db.userByHandle(handle);
  if (!u) notFound();
  const me = await getSession();
  const own = me?.id === u.id;
  const docs = await db.stories({ authorId: u.id, status: "published" });
  const mine = docs.filter((d) => d.visibility === "public" || own).map(toStory);
  const drafts = own ? (await db.stories({ authorId: u.id })).filter((d) => d.status !== "published").length : 0;
  return (
    <div>
      <section className="relative min-h-[60vh] flex items-end on-image">
        <Still src={docs[0]?.cover || IMG.windowLight} alt="" deep zoom className="absolute inset-0 rounded-none opacity-70" />
        <div className="relative px-6 md:px-14 pb-14 pt-40 w-full grid md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-8 flex items-end gap-8">
            <span className="h-24 w-24 md:h-32 md:w-32 rounded-full gradient-fallback border border-line-strong shrink-0" />
            <div>
              <div className="label text-accent mb-3">Creator{u.location ? ` · ${u.location}` : ""}</div>
              <h1 className="display text-[6.2vw] md:text-[3vw] leading-[1.06] text-ink">{u.name}</h1>
              <div className="text-sm text-ink-2 mt-3">@{u.handle}{u.makes?.length ? ` · ${u.makes.join(" · ")}` : ""}</div>
            </div>
          </div>
          <div className="md:col-span-4 md:justify-self-end flex items-center gap-8">
            <div><div className="numeral text-4xl text-ink">{mine.length}</div><div className="label-sm text-ink-3 mt-1">Published</div></div>
            {own ? <Link href="/dashboard/settings" className="btn">Edit profile</Link> : <button className="btn btn-primary">Follow</button>}
          </div>
        </div>
      </section>
      <section className="px-6 md:px-14 py-14 grid md:grid-cols-12 gap-10">
        <p className="md:col-span-7 serif text-xl md:text-2xl leading-snug text-ink">{u.bio || "This creator hasn't written a bio yet."}</p>
        <div className="md:col-span-5 md:pl-10">
          <div className="label text-accent mb-5">Creative DNA</div>
          <dl className="space-y-4">
            <div className="rule pt-3"><dt className="label-sm text-ink-3">Makes</dt><dd className="serif text-lg text-ink mt-1">{u.makes?.length ? u.makes.join(" · ") : "—"}</dd></div>
            <div className="rule pt-3"><dt className="label-sm text-ink-3">Genres</dt><dd className="serif text-lg text-ink mt-1">{u.genres?.length ? u.genres.join(" · ") : "—"}</dd></div>
            <div className="rule pt-3"><dt className="label-sm text-ink-3">Member since</dt><dd className="serif text-lg text-ink mt-1">{new Date(u.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</dd></div>
          </dl>
        </div>
      </section>
      <section className="px-6 md:px-14 py-14 rule">
        <div className="flex items-baseline justify-between mb-10"><span className="label text-ink">Stories</span>{own && drafts > 0 && <Link href="/dashboard/stories" className="label-sm text-accent">{drafts} in progress →</Link>}</div>
        {mine.length ? mine.map((s, i) => <StoryCard key={s.id} story={s} variant="wide" index={i} />) : <p className="serif italic text-ink-3">Nothing published yet.{own && <> <Link href="/dashboard/new" className="text-accent">Start an idea.</Link></>}</p>}
      </section>
    </div>
  );
}
