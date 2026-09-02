"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useProject } from "@/store/project";
import { Reader } from "@/components/story/Reader";
import type { Comment, Story } from "@/lib/types";
import { IMG } from "@/lib/data";
import { computeScreenability } from "@/lib/cinema/screenability";

const REACTIONS: Omit<Comment, "id" | "storyId" | "createdAt">[] = [
  { authorId: "a2", paragraph: 9, text: "\"It was wearing her coat.\" I did not see that coming and I should have.", likes: 12 },
  { authorId: "a8", text: "I would shoot this in one take. The whole thing. Let the place do the edit.", likes: 31 },
  { authorId: "a3", paragraph: 5, text: "The rule as furniture. That's the line.", likes: 8 },
  { authorId: "a6", paragraph: 11, text: "Open, but decided. Exactly right. Don't let anyone talk you into showing the result.", likes: 19 },
  { authorId: "a4", text: "Who would you cast? I keep seeing a face I can't name.", likes: 6 },
];

export function ProjectReader({ slug }: { slug: string }) {
  const { project } = useProject();
  const [stats, setStats] = useState({ readers: 0, likes: 0, comments: 0, saves: 0, watchVotes: 0, completion: 0 });
  const [live, setLive] = useState<Comment[]>([]);
  const [ready, setReady] = useState(false);

  const mine = project.publish?.slug === slug && project.story;

  const story: Story | null = useMemo(() => {
    if (!mine || !project.story) return null;
    const c = project.characters[0];
    return {
      id: "mine", slug, title: project.title || project.story.title, authorId: "a1",
      genre: (project.publish?.genre as Story["genre"]) || "Drama", subgenre: project.interpretation?.genre, format: (project.publish?.format as Story["format"]) || "Short Story",
      mood: "Quiet", language: project.publish?.language || "English", readingTime: Math.max(4, Math.round(project.story.paragraphs.join(" ").split(" ").length / 200)),
      synopsis: project.publish?.description || project.story.synopsis, hook: project.story.hook, cover: project.cover || IMG.tunnel, stills: [],
      tags: project.publish?.tags || [c?.name || "", project.locations[0]?.name || ""].filter(Boolean),
      publishedAt: project.publish?.publishedAt || new Date().toISOString(),
      stats, screenability: computeScreenability(stats, project.film ? project.film.stage / 8 : 0),
      chapters: [{ id: "c1", title: "One", paragraphs: project.story.paragraphs }], allowRemixes: project.publish?.allowRemixes ?? true,
    };
  }, [mine, project, slug, stats]);

  // COMMUNITY REACTS — a simulated first week, compressed into a minute.
  useEffect(() => {
    if (!story) return;
    setReady(true);
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      setStats((s) => ({
        readers: s.readers + Math.round(8 + Math.random() * 40),
        likes: s.likes + Math.round(3 + Math.random() * 14),
        comments: Math.min(REACTIONS.length + 7, s.comments + (Math.random() > 0.5 ? 1 : 0)),
        saves: s.saves + Math.round(Math.random() * 6),
        watchVotes: s.watchVotes + Math.round(2 + Math.random() * 12),
        completion: Math.min(0.93, s.completion + 0.06),
      }));
      if (tick % 3 === 0 && tick / 3 <= REACTIONS.length) {
        const r = REACTIONS[tick / 3 - 1];
        setLive((l) => [{ ...r, id: `live${tick}`, storyId: "mine", createdAt: new Date().toISOString() }, ...l]);
      }
      if (tick > 40) clearInterval(id);
    }, 1400);
    return () => clearInterval(id);
  }, [!!story]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!story) {
    return (
      <div className="px-6 md:px-14 py-40 text-center">
        <div className="label text-ink-3 mb-4">Not found</div>
        <h1 className="display text-xl text-ink">This story does not exist yet.</h1>
        <p className="serif italic text-ink-2 mt-4">Perhaps it is still in someone's head.</p>
        <div className="mt-8 flex justify-center gap-4"><Link href="/discover" className="btn">Discover stories</Link><Link href="/create" className="btn btn-primary">Start an idea</Link></div>
      </div>
    );
  }

  return (
    <>
      {ready && (
        <div className="fixed top-[72px] right-5 md:right-10 z-40 card-edit px-4 py-3 anim-up flex items-center gap-4">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="label-sm text-ink-2">Live · readers are arriving</span>
        </div>
      )}
      <Reader story={story} comments={live} isOwn liveStats={stats} />
    </>
  );
}
