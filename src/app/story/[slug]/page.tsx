import Link from "next/link";
import { stories, storyBySlug, comments } from "@/lib/data";
import { Reader } from "@/components/story/Reader";
import { ProjectReader } from "./ProjectReader";
import { LiveStory } from "./LiveStory";
import { db } from "@/lib/server/db";
import { getSession } from "@/lib/server/session";
import { toStory } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";
export function generateStaticParams() { return stories.map((s) => ({ slug: s.slug })); }

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const demo = storyBySlug(params.slug);
  if (demo) return <Reader story={demo} comments={comments.filter((c) => c.storyId === demo.id)} />;

  const doc = await db.storyBySlug(params.slug);
  if (doc) {
    const me = await getSession();
    const own = !!me && (me.id === doc.authorId || me.role === "superadmin");
    if (doc.status === "published" || own) {
      if (doc.status === "published" && doc.visibility === "private" && !own) return <Gate title="This story is private." />;
      return <LiveStory story={toStory(doc)} isOwn={!!me && me.id === doc.authorId} status={doc.status} />;
    }
    return <Gate title="This story is with the editorial desk." sub="It will be readable once it has been reviewed." />;
  }
  return <ProjectReader slug={params.slug} />;
}

function Gate({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-6 md:px-14 py-40 text-center">
      <div className="label text-ink-3 mb-4">Not yet</div>
      <h1 className="display text-xl md:text-3xl text-ink">{title}</h1>
      {sub && <p className="serif italic text-ink-2 mt-4">{sub}</p>}
      <div className="mt-8 flex justify-center gap-4"><Link href="/discover" className="btn">Discover stories</Link><Link href="/dashboard" className="btn btn-primary">Dashboard</Link></div>
    </div>
  );
}
