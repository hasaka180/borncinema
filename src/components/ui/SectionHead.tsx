import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHead({ eyebrow, title, sub, href, hrefLabel = "View all", className, size = "lg", align = "left" }: {
  eyebrow?: string; title: string; sub?: string; href?: string; hrefLabel?: string; className?: string; size?: "md" | "lg" | "xl"; align?: "left" | "center";
}) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6", align === "center" && "md:flex-col md:items-center text-center", className)}>
      <div className={cn(align === "center" && "flex flex-col items-center")}>
        {eyebrow && <div className="sub mb-4">{eyebrow}</div>}
        <h2 className={cn("display text-ink", size === "xl" ? "text-4xl md:text-6xl" : size === "lg" ? "text-2xl md:text-3xl" : "text-2xl md:text-3xl")}>{title}</h2>
        {sub && <p className="sub sub-lg normal-case tracking-[0.06em] text-ink-2 mt-4 max-w-xl leading-relaxed">{sub}</p>}
      </div>
      {href && <Link href={href} className="btn btn-ghost shrink-0">{hrefLabel} <span aria-hidden>→</span></Link>}
    </div>
  );
}
