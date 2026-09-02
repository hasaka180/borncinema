import type { Story } from "@/lib/types";
import { IMG } from "@/lib/data";

export const CATEGORIES: { slug: string; label: string; tagline: string; image: string; emphasis: string; filter: (s: Story) => boolean }[] = [
  { slug: "fiction", label: "Fiction", tagline: "Invented worlds that behave like real ones.", image: IMG.tunnel, emphasis: "worlds", filter: (s) => !["Non-Fiction", "Article", "Poetry"].includes(s.format) },
  { slug: "non-fiction", label: "Non-Fiction", tagline: "Real stories. Real light. Real refusal.", image: IMG.road, emphasis: "real", filter: (s) => s.format === "Non-Fiction" || s.genre === "Documentary" },
  { slug: "novels", label: "Novels", tagline: "Chapters, worldbuilding, and the long read.", image: IMG.fogLake, emphasis: "chapters", filter: (s) => s.format === "Novel" || s.format === "Novella" },
  { slug: "short-stories", label: "Short Stories", tagline: "The closest thing to a film that is not yet one.", image: IMG.subway, emphasis: "cinema", filter: (s) => s.format === "Short Story" },
  { slug: "poetry", label: "Poetry", tagline: "Where the typography is the image.", image: IMG.japanStreet, emphasis: "type", filter: (s) => s.format === "Poetry" },
  { slug: "articles", label: "Articles", tagline: "Ideas, argument, and the culture of cinema.", image: IMG.projector, emphasis: "ideas", filter: (s) => s.format === "Article" || s.genre === "Documentary" },
];
