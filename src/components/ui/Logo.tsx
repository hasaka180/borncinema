/** Wordmark in spaced small caps, with the grey tagline beneath when asked for. */
export function Logo({ size = "md", tagline = false, className = "" }: { size?: "md" | "lg" | "hero"; tagline?: boolean; className?: string }) {
  const sz = size === "hero" ? "text-[1.35rem] md:text-[1.7rem] tracking-[0.42em]" : size === "lg" ? "text-xl tracking-[0.4em]" : "text-[0.98rem] tracking-[0.38em]";
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className={`display !tracking-[inherit] text-ink ${sz}`} style={{ letterSpacing: "inherit" }}>Born Cinema</span>
      {tagline && <span className="sub mt-2 md:mt-3">Where cinema is born</span>}
    </span>
  );
}
