import Link from "next/link";
import { discussions, fanCasts, storyById, authorById, authors, comments } from "@/lib/data";
import { Still } from "@/components/ui/Still";
import { SectionHead } from "@/components/ui/SectionHead";
import { Reveal } from "@/components/ui/Reveal";
import { fmt, timeAgo } from "@/lib/utils";

export const metadata = { title: "Community — Born Cinema" };

const PROMPTS = ["Would this work better as a film or series?", "Who would you cast?", "What director would suit this?", "Should the ending stay ambiguous?", "What did you think the final scene meant?"];

export default function CommunityPage() {
  const recent = [...comments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
  return (
    <div className="px-6 md:px-14 pt-10 md:pt-16">
      <div className="label text-accent mb-5">Community</div>
      <h1 className="display text-[6.4vw] md:text-[3.2vw] leading-[1.06] text-ink max-w-5xl">People who say “this would make a great movie.”</h1>
      <p className="serif italic text-ink-2 text-lg md:text-xl mt-6 max-w-2xl">Discussion is built around stories, not feeds. Every thread points at a paragraph, a scene, or a choice.</p>

      <section className="mt-20 grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-7">
          <SectionHead eyebrow="Discussions" title="Open questions" size="md" />
          <div className="mt-8">
            {discussions.map((d) => {
              const st = storyById(d.storyId)!;
              return (
                <Reveal key={d.id} className="grid grid-cols-12 gap-5 py-7 rule group">
                  <div className="col-span-3 md:col-span-2"><Still src={st.cover} alt="" className="aspect-square" /></div>
                  <div className="col-span-9 md:col-span-10">
                    <div className="label-sm text-ink-3"><Link href={`/story/${st.slug}`} className="text-accent hover:underline">{st.title}</Link> · {authorById(d.authorId).name}</div>
                    <h3 className="display text-lg md:text-xl text-ink mt-2 group-hover:text-accent transition-colors">{d.question}</h3>
                    <p className="serif italic text-ink-2 mt-2">{d.excerpt}</p>
                    <div className="label-sm text-ink-3 mt-3">{d.replies} replies · active {timeAgo(d.lastActive)}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-10 card-edit p-6">
            <div className="label text-ink-3 mb-4">Start a discussion</div>
            <div className="flex flex-wrap gap-2">{PROMPTS.map((p) => <Link key={p} href="/discover" className="chip">{p}</Link>)}</div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-16">
          <div>
            <SectionHead eyebrow="Latest" title="From the margins" size="md" />
            <div className="mt-6 space-y-5">
              {recent.map((c) => {
                const st = storyById(c.storyId)!; const a = authorById(c.authorId);
                return (
                  <Link key={c.id} href={`/story/${st.slug}`} className="block group">
                    <div className="label-sm text-ink-3">{a.name} · {st.title}{c.paragraph ? ` · ¶${c.paragraph}` : ""}</div>
                    <p className="serif text-lg leading-snug text-ink mt-1 group-hover:text-accent transition-colors">{c.text}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <SectionHead eyebrow="Fan casting" title="Interpretations" size="md" href="/cinema" />
            <div className="mt-6 space-y-4">
              {fanCasts.map((c) => {
                const st = storyById(c.storyId)!;
                return (
                  <div key={c.id} className="card-edit p-5">
                    <div className="flex justify-between label-sm text-ink-3"><span>{st.title}</span><span>♥ {fmt(c.likes)}</span></div>
                    <div className="serif text-lg text-ink mt-2 leading-snug"><span className="text-accent">Director:</span> {c.director}</div>
                    <div className="serif text-lg text-ink mt-1 leading-snug"><span className="text-accent">Lead:</span> {c.lead}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <SectionHead eyebrow="Creators" title="Follow" size="md" />
            <div className="mt-6">
              {authors.map((a) => (
                <Link key={a.id} href={`/profile/${a.handle}`} className="flex items-center gap-4 py-3 rule group">
                  <span className="h-10 w-10 rounded-full overflow-hidden"><Still src={a.avatar} alt="" className="h-full w-full" /></span>
                  <span className="flex-1 min-w-0"><span className="block text-sm text-ink group-hover:text-accent transition-colors">{a.name}</span><span className="block label-sm text-ink-3 truncate mt-0.5">{a.role}</span></span>
                  <span className="label-sm text-ink-3">{fmt(a.followers)}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-28">
        <SectionHead eyebrow="Follow interests" title="Cinema interests" size="md" />
        <div className="mt-8 flex flex-wrap gap-2">
          {["Slow cinema", "One-location thrillers", "Arctic light", "Time loops", "Unreliable narrators", "Migration stories", "Animated adaptations", "Real-time films", "Cities as characters", "Silent endings"].map((t) => <span key={t} className="chip">{t} +</span>)}
        </div>
      </section>
    </div>
  );
}
