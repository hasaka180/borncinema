import { stories as demo, authorByHandle } from "@/lib/data";
import type { Story } from "@/lib/types";
import { db, type StoryDoc } from "./db";
import { computeScreenability } from "@/lib/cinema/screenability";

/** A member's published story, shaped like the demo catalogue so every page can render it. */
export function toStory(doc: StoryDoc): Story {
  return {
    id: doc.id, slug: doc.slug, title: doc.title, authorId: authorByHandle(doc.authorHandle)?.id || doc.authorId,
    genre: (doc.genre as Story["genre"]) || "Drama", format: (doc.format as Story["format"]) || "Short Story", mood: "Quiet", language: doc.language || "English",
    readingTime: Math.max(3, Math.round(doc.paragraphs.join(" ").split(/\s+/).length / 200)),
    synopsis: doc.synopsis, hook: doc.hook, cover: doc.cover, stills: [], tags: doc.tags, publishedAt: doc.publishedAt || doc.createdAt,
    stats: doc.stats, screenability: computeScreenability(doc.stats), chapters: [{ id: "c1", title: "One", paragraphs: doc.paragraphs }],
    allowRemixes: doc.allowRemixes, featured: doc.featured, newVoice: true,
    author: authorByHandle(doc.authorHandle) ? undefined : { name: doc.authorName, handle: doc.authorHandle, role: "Creator" },
  };
}

/** Demo catalogue plus every member story the editorial desk has published. */
export async function getPublicStories(): Promise<Story[]> {
  const published = await db.stories({ status: "published" });
  return [...published.filter((s) => s.visibility === "public").map(toStory), ...demo];
}
