"use client";
import { useRef } from "react";
import type { Story } from "@/lib/types";
import { StoryCard } from "./StoryCard";

export function StoryRail({ stories, variant = "tall" }: { stories: Story[]; variant?: "tall" | "poster" }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.7), behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="flex gap-5 md:gap-6 overflow-x-auto hide-scroll snap-x snap-mandatory -mx-5 px-5 md:-mx-10 md:px-10 pb-2">
        {stories.map((s) => (
          <div key={s.id} className="snap-start shrink-0 w-[72vw] xs:w-[52vw] md:w-[34vw] lg:w-[24vw] xl:w-[20vw]"><StoryCard story={s} variant={variant} /></div>
        ))}
      </div>
      <div className="hidden md:flex absolute -top-16 right-0 gap-2">
        <button onClick={() => scroll(-1)} className="btn btn-sm" aria-label="Previous">←</button>
        <button onClick={() => scroll(1)} className="btn btn-sm" aria-label="Next">→</button>
      </div>
    </div>
  );
}
