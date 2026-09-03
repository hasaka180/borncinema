import Link from "next/link";
import { cn } from "@/lib/utils";

function Pill({ genre, count }: { genre: string; count: number }) {
  return (
    <Link
      href={`/discover?genre=${encodeURIComponent(genre)}`}
      className="group inline-flex items-baseline gap-2.5 rounded-full border border-line px-3.5 py-2 hover:border-accent transition-colors whitespace-nowrap"
    >
      <span className="display text-[0.82rem] md:text-[0.92rem] text-ink group-hover:text-accent transition-colors">{genre}</span>
      <span className="label-sm text-ink-3 text-[0.55rem]">{count || "·"}</span>
    </Link>
  );
}

/**
 * Genres. Wrapped and static from md up; on small screens two rows drift past
 * in opposite directions, pausing on touch. Reduced motion turns them into
 * ordinary scrollable rows.
 */
export function GenreRail({ genres }: { genres: { genre: string; count: number }[] }) {
  const half = Math.ceil(genres.length / 2);
  const rows = [genres.slice(0, half), genres.slice(half)];

  return (
    <>
      <div className="md:hidden -mx-6 space-y-2.5 genre-fade">
        {rows.map((row, i) => (
          <div key={i} className="genre-track hide-scroll" data-reverse={i === 1 ? "" : undefined}>
            <div className={cn("genre-marquee", i === 1 && "genre-marquee--rev")}>
              {[0, 1].map((copy) => (
                <div key={copy} className="flex gap-2.5 pr-2.5" aria-hidden={copy === 1 || undefined}>
                  {row.map((g) => <Pill key={`${copy}-${g.genre}`} genre={g.genre} count={g.count} />)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:flex flex-wrap gap-2.5">
        {genres.map((g) => <Pill key={g.genre} genre={g.genre} count={g.count} />)}
      </div>
    </>
  );
}
