import Link from "next/link";
import { Still } from "@/components/ui/Still";
import { stories } from "@/lib/data";
import { CATEGORIES } from "./categories";

export const metadata = { title: "Stories — Born Cinema" };

export default function StoriesIndex() {
  return (
    <div className="px-6 md:px-14 pt-10 md:pt-16">
      <div className="label text-accent mb-5">Stories</div>
      <h1 className="display text-[6.4vw] md:text-[3.3vw] leading-[1.06] text-ink max-w-5xl">Six ways a story can exist.</h1>
      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((c, i) => {
          const count = stories.filter(c.filter).length;
          return (
            <Link key={c.slug} href={`/stories/${c.slug}`} className="group relative min-h-[360px] md:min-h-[440px] on-image rounded-cine overflow-hidden border border-line">
              <Still src={c.image} alt="" deep className="absolute inset-0 rounded-none opacity-60 group-hover:opacity-90 transition-opacity duration-1000" />
              <div className="relative h-full p-7 md:p-9 flex flex-col justify-between">
                <div className="flex justify-between label-sm text-ink-3"><span>{String(i + 1).padStart(2, "0")}</span><span>{count} published</span></div>
                <div>
                  <div className="display text-lg md:text-xl text-ink">{c.label}</div>
                  <p className="serif italic text-ink-2 mt-3 text-lg leading-snug max-w-xs">{c.tagline}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
