"use client";
import { useEffect, useState } from "react";
import type { Comment, Story } from "@/lib/types";
import { Reader } from "@/components/story/Reader";
import { computeScreenability } from "@/lib/cinema/screenability";

const REACTIONS: Omit<Comment, "id" | "storyId" | "createdAt">[] = [
  { authorId: "a2", paragraph: 3, text: "This is the paragraph where the story stops being a premise and becomes a person.", likes: 12 },
  { authorId: "a8", text: "I would shoot this in one take. Let the place do the edit.", likes: 31 },
  { authorId: "a3", paragraph: 5, text: "The rule as furniture. That's the line.", likes: 8 },
  { authorId: "a6", paragraph: 9, text: "Open, but decided. Don't let anyone talk you into showing the result.", likes: 19 },
  { authorId: "a4", text: "Who would you cast? I keep seeing a face I can't name.", likes: 6 },
];

/** A member's story. For the author, the first week of readers arrives compressed into a minute. */
export function LiveStory({ story, isOwn, status }: { story: Story; isOwn: boolean; status: string }) {
  const [stats, setStats] = useState(story.stats);
  const [live, setLive] = useState<Comment[]>([]);
  const simulate = isOwn && status === "published";
  useEffect(() => {
    if (!simulate) return;
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      setStats((s) => ({ readers: s.readers + Math.round(8 + Math.random() * 40), likes: s.likes + Math.round(3 + Math.random() * 14), comments: Math.min(REACTIONS.length + 7, s.comments + (Math.random() > 0.5 ? 1 : 0)), saves: s.saves + Math.round(Math.random() * 6), watchVotes: s.watchVotes + Math.round(2 + Math.random() * 12), completion: Math.min(0.93, s.completion + 0.06) }));
      if (tick % 3 === 0 && tick / 3 <= REACTIONS.length) { const r = REACTIONS[tick / 3 - 1]; setLive((l) => [{ ...r, id: `live${tick}`, storyId: story.id, createdAt: new Date().toISOString() }, ...l]); }
      if (tick > 40) clearInterval(id);
    }, 1400);
    return () => clearInterval(id);
  }, [simulate, story.id]);
  const s = { ...story, screenability: computeScreenability(stats) };
  return (
    <>
      {simulate && <div className="fixed top-[72px] right-6 md:right-14 z-40 panel px-4 py-3 anim-up flex items-center gap-4"><span className="h-2 w-2 rounded-full bg-accent animate-pulse" /><span className="label-sm text-ink-2">Live · readers are arriving</span></div>}
      {status !== "published" && <div className="fixed top-[72px] right-6 md:right-14 z-40 panel px-4 py-3 anim-up label-sm text-ink-2">Preview · {status === "submitted" ? "with the editorial desk" : status}</div>}
      <Reader story={s} comments={live} isOwn={isOwn} liveStats={stats} />
    </>
  );
}
