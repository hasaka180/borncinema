"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, reduceMotion } from "@/lib/motion";
import { FIGURES } from "./Characters";
import { cn, pad } from "@/lib/utils";

export const STEPS = [
  { t: "Idea", d: "What's in your head? A sentence is enough. The partner reads it and asks the first useful question.", line: "“A woman receives a phone call from herself, twenty years in the future…”" },
  { t: "Develop", d: "One creative question at a time. Names, places, desires, fears. Every suggestion is yours to use, edit, or replace.", line: "“Who is she? Where does this happen? What does she want?”" },
  { t: "Write", d: "The structure becomes prose. Rewrite any paragraph. Every version is kept; nothing is ever destroyed.", line: "“Now it exists.”" },
  { t: "Share", d: "Readers respond to the actual paragraphs. They tell you whether they would watch it as a film.", line: "“94% would watch this.”" },
  { t: "Become cinema", d: "Treatment, cast, locations, visual language, storyboard, preview. The film before the film.", line: "“Now imagine it on screen.”" },
];

/**
 * Sticky, scroll-driven walkthrough. The timeline fills with scroll progress; each stage
 * brings its own hand-drawn character, which draws itself on when the stage becomes active.
 */
export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const svgRefs = useRef<(SVGSVGElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [reduce, setReduce] = useState(false);
  const prev = useRef(-1);

  useEffect(() => {
    if (reduceMotion()) { setReduce(true); return; }
    const el = sectionRef.current; if (!el) return;
    const st = ScrollTrigger.create({
      trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6,
      onUpdate: (self) => {
        if (fillRef.current) fillRef.current.style.height = `${self.progress * 100}%`;
        const i = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length + 0.0001));
        if (i !== prev.current) { prev.current = i; setActive(i); }
      },
    });
    return () => st.kill();
  }, []);

  // draw the active figure on, let the previous one dissolve
  useEffect(() => {
    if (reduce) return;
    svgRefs.current.forEach((svg, i) => {
      if (!svg) return;
      const paths = svg.querySelectorAll("path");
      if (i === active) {
        gsap.killTweensOf([svg, paths]);
        gsap.set(svg, { autoAlpha: 1 });
        gsap.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.045 });
        gsap.fromTo(svg, { y: 14, rotate: -1.5 }, { y: 0, rotate: 0, duration: 1.4, ease: "power3.out" });
      } else {
        gsap.to(svg, { autoAlpha: 0, duration: 0.5, ease: "power2.out" });
      }
    });
  }, [active, reduce]);

  const Figure = ({ i, className }: { i: number; className?: string }) => {
    const F = FIGURES[i];
    return (
      <svg ref={(el) => { svgRefs.current[i] = el; }} viewBox="0 0 240 300" className={cn("figure-svg text-ink", className)} aria-hidden style={{ strokeDasharray: 1, strokeDashoffset: reduce ? 0 : 1 }}>
        <defs>
          <filter id={`sketch-${i}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed={i + 3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter={`url(#sketch-${i})`}><F /></g>
      </svg>
    );
  };

  if (reduce) {
    return (
      <section className="px-6 md:px-14 mt-32 md:mt-44">
        <div className="label text-accent mb-4">How it works</div>
        <h2 className="display text-xl md:text-3xl text-ink">From idea to cinema</h2>
        <div className="mt-12 grid md:grid-cols-5 gap-8">
          {STEPS.map((s, i) => (
            <div key={s.t} className="card-edit p-6">
              <Figure i={i} className="w-full max-w-[200px] mx-auto" />
              <div className="numeral text-3xl text-accent mt-4">{pad(i + 1)}</div>
              <div className="display text-xl text-ink mt-1">{s.t}</div>
              <p className="serif italic text-ink-2 mt-2 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative mt-32 md:mt-44" style={{ height: `${STEPS.length * 100 + 40}vh` }} aria-label="How it works">
      <div className="sticky top-0 h-screen flex items-center px-6 md:px-14">
        <div className="w-full grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* timeline */}
          <div className="lg:col-span-5 flex gap-8">
            <div className="relative w-px shrink-0 self-stretch" style={{ background: "var(--line)" }}>
              <div ref={fillRef} className="absolute left-0 top-0 w-px bg-accent transition-[height] duration-300 ease-out" style={{ height: 0 }} />
              {STEPS.map((_, i) => (
                <span key={i} className={cn("absolute -left-[5px] h-[11px] w-[11px] rounded-full border transition-colors duration-500", i <= active ? "bg-accent border-accent" : "border-line-strong")} style={{ top: `${(i / (STEPS.length - 1)) * 100}%`, background: i <= active ? "var(--accent)" : "var(--bg)" }} />
              ))}
            </div>
            <div className="flex-1">
              <div className="label text-accent mb-3">How it works</div>
              <h2 className="display text-xl md:text-3xl text-ink mb-8">From idea to cinema</h2>
              <ol className="space-y-5">
                {STEPS.map((s, i) => (
                  <li key={s.t} className={cn("transition-all duration-700 ease-cine", i === active ? "opacity-100" : "opacity-35")}>
                    <div className="flex items-baseline gap-4">
                      <span className={cn("numeral text-2xl transition-colors", i === active ? "text-accent" : "text-ink-3")}>{pad(i + 1)}</span>
                      <span className="display text-lg md:text-xl text-ink">{s.t}</span>
                    </div>
                    <div className={cn("grid transition-all duration-700 ease-cine", i === active ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr]")}>
                      <p className="serif italic text-ink-2 text-base md:text-lg leading-snug overflow-hidden pl-11">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link href="/create" className="btn btn-primary mt-8">Start an idea</Link>
            </div>
          </div>

          {/* stage */}
          <div className="lg:col-span-7">
            <div className="panel relative aspect-[4/3] md:aspect-[5/4] lg:aspect-[16/11] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0" style={{ background: "radial-gradient(60% 55% at 50% 45%, var(--atmo-1), transparent 70%), radial-gradient(40% 40% at 70% 80%, var(--atmo-2), transparent 70%)" }} />
              <div className="absolute inset-x-8 top-6 flex justify-between label-sm text-ink-3"><span>Stage {pad(active + 1)} of {pad(STEPS.length)}</span><span>{STEPS[active].t}</span></div>
              <div className="relative h-[68%] aspect-[4/5]">
                {STEPS.map((_, i) => <Figure key={i} i={i} className="absolute inset-0 h-full w-full" />)}
              </div>
              <div className="absolute inset-x-8 bottom-7">
                <p key={active} className="serif italic text-ink-2 text-base md:text-xl anim-up">{STEPS[active].line}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
