import Link from "next/link";
import type { Story } from "@/lib/types";
import { authorOf } from "@/lib/data";
import { Still } from "@/components/ui/Still";
import { cn, fmt, pad } from "@/lib/utils";

type Variant = "poster" | "wide" | "feature" | "minimal" | "tall" | "row";

export function StoryCard({ story, variant = "poster", index, className, priority }: { story: Story; variant?: Variant; index?: number; className?: string; priority?: boolean }) {
  const author = authorOf(story);
  const href = `/story/${story.slug}`;
  const meta = `${story.format} · ${story.subgenre || story.genre}`;

  if (variant === "feature") {
    return (
      <Link href={href} className={cn("group grid md:grid-cols-12 gap-8 md:gap-12 items-end", className)}>
        <div className="md:col-span-8 relative">
          <Still src={story.cover} alt={story.title} vignette priority={priority} className="aspect-[16/9] md:aspect-[21/10]" />
          <div className="absolute -bottom-6 md:-bottom-10 left-4 md:left-8 z-10 on-image">
            <div className="display text-[5.4vw] md:text-[2.7vw] leading-[1.06] text-ink drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">{story.title.split(" ").map((w, i) => <span key={i} className="block">{w}</span>)}</div>
          </div>
        </div>
        <div className="md:col-span-4 pt-10 md:pt-0 md:pb-6">
          <div className="label text-accent mb-4">{meta}</div>
          <p className="serif text-xl md:text-2xl leading-snug text-ink">“{story.hook}”</p>
          <div className="flex items-center gap-6 mt-8 rule pt-6">
            <div><div className="numeral text-3xl">{fmt(story.stats.readers)}</div><div className="label-sm text-ink-3 mt-1">Readers</div></div>
            <div><div className="numeral text-3xl">{fmt(story.stats.likes)}</div><div className="label-sm text-ink-3 mt-1">Likes</div></div>
            <div><div className="numeral text-3xl text-accent">{story.screenability}%</div><div className="label-sm text-ink-3 mt-1">Would watch</div></div>
          </div>
          <div className="mt-6 text-sm text-ink-2">{author.name} · {story.readingTime} min</div>
          <span className="btn btn-ghost mt-4">Read story <span aria-hidden>→</span></span>
        </div>
      </Link>
    );
  }

  if (variant === "wide") {
    return (
      <Link href={href} className={cn("group grid grid-cols-12 gap-5 md:gap-8 items-center py-8 rule", className)}>
        {index !== undefined && <div className="col-span-1 numeral text-2xl md:text-3xl text-ink-3">{pad(index + 1)}</div>}
        <div className={cn(index !== undefined ? "col-span-4 md:col-span-3" : "col-span-5 md:col-span-4")}>
          <Still src={story.cover} alt={story.title} className="aspect-[4/3]" />
        </div>
        <div className={cn(index !== undefined ? "col-span-7 md:col-span-8" : "col-span-7 md:col-span-8", "flex flex-col md:flex-row md:items-center gap-4 md:gap-10")}>
          <div className="flex-1 min-w-0">
            <div className="label-sm text-accent mb-2">{meta}</div>
            <h3 className="display text-lg md:text-xl text-ink group-hover:text-accent transition-colors">{story.title}</h3>
            <p className="serif italic text-ink-2 mt-2 text-lg leading-snug line-clamp-2">{story.hook}</p>
            <div className="text-xs text-ink-3 mt-3">{author.name} · {story.readingTime} min</div>
          </div>
          <div className="flex md:flex-col items-center md:items-end gap-4 md:gap-1 shrink-0">
            <span className="numeral text-2xl md:text-3xl text-accent">{story.screenability}%</span>
            <span className="label-sm text-ink-3">screenable</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "row") {
    return (
      <Link href={href} className={cn("group flex items-center gap-5 py-4 rule", className)}>
        {index !== undefined && <span className="numeral text-2xl text-ink-3 w-8">{pad(index + 1)}</span>}
        <Still src={story.cover} alt="" className="h-14 w-20 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="display text-xl text-ink group-hover:text-accent transition-colors truncate">{story.title}</div>
          <div className="text-xs text-ink-3 mt-1">{author.name} · {story.genre}</div>
        </div>
        <span className="numeral text-2xl text-accent">{story.screenability}%</span>
      </Link>
    );
  }

  if (variant === "minimal") {
    return (
      <Link href={href} className={cn("group block", className)}>
        <div className="label-sm text-accent mb-3">{meta}</div>
        <h3 className="display text-lg md:text-xl text-ink group-hover:text-accent transition-colors">{story.title}</h3>
        <p className="serif italic text-ink-2 mt-3 text-lg leading-snug">{story.hook}</p>
        <div className="flex items-center gap-4 mt-4 text-xs text-ink-3"><span>{author.name}</span><span>·</span><span>{story.readingTime} min</span><span>·</span><span className="text-accent">{story.screenability}% would watch</span></div>
      </Link>
    );
  }

  if (variant === "tall") {
    return (
      <Link href={href} className={cn("group block relative on-image", className)}>
        <Still src={story.cover} alt={story.title} deep className="aspect-[3/4]">
          <div className="absolute inset-0 z-[2] flex flex-col justify-end p-5">
            <div className="label-sm text-accent mb-3">{meta}</div>
            <h3 className="display text-lg md:text-xl text-ink leading-[1.06]">{story.title}</h3>
            <p className="serif italic text-ink-2 text-sm mt-3 leading-snug opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-24 transition-all duration-700 ease-cine">{story.hook}</p>
            <div className="flex items-center justify-between mt-4 text-xs text-ink-3"><span>{author.name}</span><span className="text-accent">{story.screenability}%</span></div>
          </div>
        </Still>
      </Link>
    );
  }

  // poster (default)
  return (
    <Link href={href} className={cn("group block", className)}>
      <Still src={story.cover} alt={story.title} vignette priority={priority} className="aspect-[4/5] md:aspect-[3/4]">
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-[2] on-image">
          <span className="label-sm text-ink-2 bg-bg/40 backdrop-blur-sm px-2 py-1">{story.format}</span>
          <span className="numeral text-2xl text-accent drop-shadow">{story.screenability}%</span>
        </div>
      </Still>
      <div className="mt-5">
        <div className="label-sm text-accent mb-2">{story.subgenre || story.genre} · {story.readingTime} min</div>
        <h3 className="display text-lg md:text-xl text-ink group-hover:text-accent transition-colors leading-[1.06]">{story.title}</h3>
        <p className="serif italic text-ink-2 mt-3 leading-snug text-[1.05rem] line-clamp-3">“{story.hook}”</p>
        <div className="flex items-center gap-3 mt-4 text-xs text-ink-3">
          <span>{fmt(story.stats.readers)} readers</span><span>·</span><span>{fmt(story.stats.likes)} likes</span><span>·</span><span>{fmt(story.stats.comments)} comments</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-ink-2">{author.name}</span>
          <span className="label-sm text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity">Read story →</span>
        </div>
      </div>
    </Link>
  );
}
