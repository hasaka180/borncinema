import Link from "next/link";
import { getSession } from "@/lib/server/session";
import { db } from "@/lib/server/db";
import { stories as demo, IMG } from "@/lib/data";
import { Still } from "@/components/ui/Still";
import { StatusPill } from "@/components/dashboard/StatusPill";
import { computeScreenability } from "@/lib/cinema/screenability";
import { fmt, timeAgo } from "@/lib/utils";
export const dynamic = "force-dynamic";

export default async function Overview({ searchParams }: { searchParams: { welcome?: string } }) {
  const me = (await getSession())!;
  const admin = me.role === "superadmin";
  const mine = await db.stories(admin ? {} : { authorId: me.id });
  const queue = admin ? mine.filter((s) => s.status === "submitted") : [];
  const published = mine.filter((s) => s.status === "published");
  const totals = published.reduce((a, s) => ({ readers: a.readers + s.stats.readers, likes: a.likes + s.stats.likes, votes: a.votes + s.stats.watchVotes }), { readers: 0, likes: 0, votes: 0 });
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const latest = mine[0];

  return (
    <div className="max-w-6xl">
      <div className="label text-accent mb-3">{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</div>
      <h1 className="display text-xl md:text-3xl text-ink">{searchParams.welcome ? "Welcome" : greet}, {me.name.split(" ")[0]}.</h1>
      {searchParams.welcome && <p className="serif italic text-ink-2 mt-3 max-w-xl">Your studio is open. Start with a sentence; the Story Partner asks the rest. Public stories are read by the editorial desk before they go live.</p>}

      <div className="mt-10 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 relative card-edit overflow-hidden on-image min-h-[300px]">
          <Still src={latest?.cover || IMG.tunnel} alt="" deep zoom className="absolute inset-0 rounded-none opacity-70" />
          <div className="relative p-7 md:p-9 h-full flex flex-col justify-between min-h-[300px]">
            <div className="flex justify-between label-sm text-ink-3"><span>{admin ? "Editorial desk" : "Continue creating"}</span>{latest && <StatusPill status={latest.status} />}</div>
            <div>
              <div className="display text-xl md:text-3xl text-ink leading-[1.06]">{admin ? (queue.length ? `${queue.length} ${queue.length === 1 ? "story" : "stories"} waiting for review` : "The queue is clear.") : latest ? latest.title : "What's in your head?"}</div>
              <p className="serif italic text-ink-2 mt-3 line-clamp-2 max-w-lg">{admin ? "Every public story is read here before it exists for readers." : latest ? latest.hook : "A sentence is enough to begin."}</p>
              <div className="flex gap-3 mt-6">
                {admin ? <Link href="/dashboard/review" className="btn btn-primary btn-sm">Open review queue</Link> : latest ? <Link href={`/dashboard/stories/${latest.id}`} className="btn btn-primary btn-sm">Open story</Link> : null}
                <Link href="/dashboard/new" className="btn btn-sm">{latest || admin ? "Start another idea" : "Start an idea"}</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {[["Stories", mine.length], ["Published", published.length], ["Readers", totals.readers], ["Watch votes", totals.votes]].map(([k, v]) => (
            <div key={k as string} className="card-edit p-5"><div className="numeral text-4xl text-ink">{fmt(Number(v))}</div><div className="label-sm text-ink-3 mt-2">{k as string}</div></div>
          ))}
          <div className="card-edit p-5 col-span-2"><div className="label-sm text-ink-3 mb-3">Screenability of your published work</div>{published.length ? published.slice(0, 3).map((s) => <div key={s.id} className="flex items-center justify-between py-2 rule"><span className="text-sm text-ink truncate mr-4">{s.title}</span><span className="numeral text-xl text-accent">{computeScreenability(s.stats)}%</span></div>) : <p className="serif italic text-ink-3 text-sm">Nothing published yet. Readers will show up here.</p>}</div>
        </div>
      </div>

      <div className="mt-12 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <div className="flex items-end justify-between mb-5"><div className="label text-ink-3">{admin ? "Latest submissions" : "Your stories"}</div><Link href={admin ? "/dashboard/review" : "/dashboard/stories"} className="label-sm text-accent">All →</Link></div>
          {mine.length === 0 && <div className="card-edit p-8 text-center"><p className="serif italic text-ink-2">No stories yet.</p><Link href="/dashboard/new" className="btn btn-primary btn-sm mt-4">Write the first</Link></div>}
          {mine.slice(0, 5).map((s) => (
            <Link key={s.id} href={admin && s.status === "submitted" ? `/dashboard/review?open=${s.id}` : `/dashboard/stories/${s.id}`} className="flex items-center gap-5 py-4 rule group">
              <Still src={s.cover || IMG.tunnel} alt="" className="h-14 w-20 shrink-0 !rounded-xl" />
              <span className="flex-1 min-w-0"><span className="block display text-xl text-ink group-hover:text-accent transition-colors truncate">{s.title}</span><span className="block label-sm text-ink-3 mt-1">{admin ? `${s.authorName} · ` : ""}{s.format} · updated {timeAgo(s.updatedAt)}</span></span>
              <StatusPill status={s.status} />
            </Link>
          ))}
        </div>
        <div className="lg:col-span-5">
          <div className="label text-ink-3 mb-5">Cinema discoveries</div>
          {[...demo].sort((a, b) => b.screenability - a.screenability).slice(0, 4).map((s) => (
            <Link key={s.id} href={`/story/${s.slug}`} className="flex items-center gap-4 py-3 rule group"><Still src={s.cover} alt="" className="h-12 w-16 shrink-0 !rounded-xl" /><span className="flex-1 min-w-0"><span className="block text-sm text-ink group-hover:text-accent transition-colors truncate">{s.title}</span><span className="block label-sm text-ink-3">{s.genre}</span></span><span className="numeral text-lg text-accent">{s.screenability}%</span></Link>
          ))}
        </div>
      </div>
    </div>
  );
}
