"use client";
import Link from "next/link";
import { useProject } from "@/store/project";
import { stories, authors, ideas, comments, storyById, authorById, notifications } from "@/lib/data";
import { Still } from "@/components/ui/Still";
import { StoryCard } from "@/components/story/StoryCard";
import { pad, timeAgo } from "@/lib/utils";

const STEP_LABEL: Record<string, string> = { idea: "Idea", interpret: "Exploring", name: "Naming the protagonist", location: "Choosing a place", locationDetail: "Refining the place", desire: "What she wants", fear: "What she fears", secret: "Her secret", direction: "Story direction", structure: "Structure", compose: "Composing", read: "Reading draft", publish: "Publishing", published: "Published", cinema: "Cinema" };

export default function HomePage() {
  const { project } = useProject();
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const saved = stories.slice(2, 5);
  const following = authors.slice(1, 5);
  const discoveries = [...stories].sort((a, b) => b.screenability - a.screenability).slice(0, 3);
  const recent = comments.slice(0, 4);
  const hasProject = project.idea.trim().length > 0;

  return (
    <div className="px-6 md:px-14 pt-10 md:pt-16">
      <div className="label text-accent mb-5">{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</div>
      <h1 className="display text-[6.2vw] md:text-[3vw] leading-[1.06] text-ink">{greet},<br />Mara.</h1>

      <section className="mt-16 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <div className="label text-ink-3 mb-5">Continue creating</div>
          {hasProject ? (
            <Link href={project.step === "published" || project.step === "cinema" ? "/cinema/develop" : "/create"} className="group card-edit relative overflow-hidden block min-h-[360px] on-image">
              <Still src={project.cover || stories[0].stills[0]} alt="" deep className="absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity duration-1000" />
              <div className="relative p-8 md:p-10 h-full flex flex-col justify-between min-h-[360px]">
                <div className="flex justify-between label-sm text-ink-3"><span>Current project · {STEP_LABEL[project.step] || project.step}</span><span>v{pad(project.versions.length + 1)}</span></div>
                <div>
                  <div className="display text-lg md:text-xl text-ink leading-[1.06]">{project.title || project.story?.title || "Untitled idea"}</div>
                  <p className="serif italic text-ink-2 mt-4 text-lg line-clamp-2">{project.idea}</p>
                  <div className="flex gap-6 mt-5 label-sm text-ink-3"><span>{project.characters.length} characters</span><span>{project.locations.length} locations</span><span>{project.versions.length} versions</span></div>
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/create" className="card-edit block p-10 min-h-[300px] flex flex-col justify-between group">
              <div className="label-sm text-ink-3">Nothing in progress</div>
              <div><div className="display text-lg md:text-xl text-ink group-hover:text-accent transition-colors">What's in your head?</div><p className="serif italic text-ink-2 mt-3">A sentence is enough to begin.</p></div>
            </Link>
          )}
        </div>
        <div className="lg:col-span-5">
          <div className="label text-ink-3 mb-5">Ideas</div>
          <div>
            {ideas.slice(0, 4).map((i) => (
              <Link key={i.id} href="/ideas" className="block py-4 rule group"><p className="serif text-lg leading-snug text-ink group-hover:text-accent transition-colors">{i.text}</p><div className="label-sm text-ink-3 mt-2">{i.status} · {timeAgo(i.createdAt)}</div></Link>
            ))}
          </div>
          <Link href="/ideas" className="btn btn-ghost mt-4">Open the vault →</Link>
        </div>
      </section>

      <section className="mt-24">
        <div className="label text-ink-3 mb-8">Continue reading</div>
        <div className="grid sm:grid-cols-3 gap-8">{saved.map((s) => <StoryCard key={s.id} story={s} variant="poster" />)}</div>
      </section>

      <section className="mt-24 grid lg:grid-cols-12 gap-14">
        <div className="lg:col-span-4">
          <div className="label text-ink-3 mb-6">People you're following</div>
          {following.map((a) => (
            <Link key={a.id} href={`/profile/${a.handle}`} className="flex items-center gap-4 py-3 rule group">
              <span className="h-10 w-10 rounded-full overflow-hidden"><Still src={a.avatar} alt="" className="h-full w-full" /></span>
              <span className="flex-1"><span className="block text-sm text-ink group-hover:text-accent transition-colors">{a.name}</span><span className="block label-sm text-ink-3 mt-0.5">{a.role}</span></span>
            </Link>
          ))}
        </div>
        <div className="lg:col-span-4">
          <div className="label text-ink-3 mb-6">Cinema discoveries</div>
          {discoveries.map((s, i) => <StoryCard key={s.id} story={s} variant="row" index={i} />)}
        </div>
        <div className="lg:col-span-4">
          <div className="label text-ink-3 mb-6">Recent comments</div>
          {recent.map((c) => { const st = storyById(c.storyId)!; return <Link key={c.id} href={`/story/${st.slug}`} className="block py-3 rule group"><div className="label-sm text-ink-3">{authorById(c.authorId).name} on {st.title}</div><p className="serif leading-snug text-ink mt-1 group-hover:text-accent transition-colors line-clamp-2">{c.text}</p></Link>; })}
          <Link href="/notifications" className="btn btn-ghost mt-4">{notifications.filter((n) => !n.read).length} new notifications →</Link>
        </div>
      </section>
    </div>
  );
}
