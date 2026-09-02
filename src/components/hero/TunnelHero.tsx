"use client";
import Link from "next/link";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { stories, authorById } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * CINEMATIC TUNNEL
 * Scroll flies the camera down a corridor of screens.
 * Scroll VELOCITY, not position, drives the motion blur: hard scrubbing smears
 * the corridor while the titles (a separate, unfiltered layer) stay sharp.
 */

const RINGS = 12;
const SPACING = 640; // px between rings along z
const DEPTH = SPACING * (RINGS - 1);
const END_Z = -(DEPTH + 900); // the end-wall

type Wall = "L" | "R" | "T" | "B";

export function TunnelHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const corridorRef = useRef<HTMLDivElement>(null);
  const blurRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const screenRefs = useRef<(HTMLDivElement | null)[]>([]);
  const velRef = useRef(0);
  const [phase, setPhase] = useState(0); // 0 hero, 1 mid, 2 arrival
  const [reduce, setReduce] = useState(false);
  const [hud, setHud] = useState({ p: 0, v: 0 });

  const screens = useMemo(() => {
        const out: { z: number; wall: Wall; story: (typeof stories)[number]; i: number }[] = [];
    let k = 0;
    for (let r = 0; r < RINGS; r++) {
      const z = -r * SPACING;
      // side walls only: the centre of the frame stays empty, as in a title card
      const useWalls = ["L", "R"] as Wall[];
      useWalls.forEach((w) => {
        out.push({ z, wall: w, story: stories[k % stories.length], i: k });
        k++;
      });
    }
    return out;
  }, []);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(rm.matches);
    const onRm = () => setReduce(rm.matches);
    rm.addEventListener?.("change", onRm);

    let raf = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let prevPhase = -1;
    let hudTick = 0;

    const frame = (t: number) => {
      const el = sectionRef.current;
      const corridor = corridorRef.current;
      if (!el || !corridor) { raf = requestAnimationFrame(frame); return; }

      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, total)));

      // velocity (px per ms), smoothed
      const y = window.scrollY;
      const dt = Math.max(8, t - lastT);
      const inst = (y - lastY) / dt;
      lastY = y; lastT = t;
      const smooth = rm.matches ? 0 : velRef.current + (inst - velRef.current) * 0.14;
      velRef.current = Math.abs(smooth) < 0.001 ? 0 : smooth;

      const speed = Math.abs(velRef.current); // ~0 (idle) .. ~4 (hard scrub)
      const blur = rm.matches ? 0 : Math.min(26, speed * 9);
      const stretch = rm.matches ? 1 : 1 + Math.min(0.09, speed * 0.028);

      const camZ = p * DEPTH;
      corridor.style.transform = `translate3d(0,0,${camZ}px)`;

      if (blurRef.current) {
        blurRef.current.style.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px) saturate(${1 + Math.min(0.5, speed * 0.18)})` : "none";
        blurRef.current.style.transform = `scale3d(${stretch}, ${stretch}, 1)`;
        // at rest the corridor is a rumour in the dark; motion and depth bring it up
        blurRef.current.style.opacity = String(Math.min(1, 0.32 + p * 1.1 + Math.min(0.35, speed * 0.2)));
      }

      // per-screen visibility relative to camera
      const refs = screenRefs.current;
      for (let i = 0; i < screens.length; i++) {
        const s = refs[i]; if (!s) continue;
        const zWorld = screens[i].z + camZ; // 0 = at camera plane
        let o = 0;
        if (zWorld < 120) {
          const d = -zWorld;
          o = d < 400 ? 1 : d > DEPTH * 0.9 ? Math.max(0, 1 - (d - DEPTH * 0.9) / (DEPTH * 0.35)) : 1;
          if (zWorld > -60) o *= Math.max(0, (120 - zWorld) / 180);
        }
        s.style.opacity = o.toFixed(3);
        s.style.visibility = o <= 0.01 ? "hidden" : "visible";
      }

      if (endRef.current) {
        const dz = END_Z + camZ; // approaches 0 as camera arrives
        const near = Math.max(0, Math.min(1, 1 - (-dz) / 3400));
        endRef.current.style.opacity = (near * near).toFixed(3);
      }

      const ph = p < 0.32 ? 0 : p < 0.72 ? 1 : 2;
      if (ph !== prevPhase) { prevPhase = ph; setPhase(ph); }
      if (++hudTick % 6 === 0) setHud({ p, v: speed });

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); rm.removeEventListener?.("change", onRm); };
  }, [screens]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: reduce ? "100vh" : "460vh" }} aria-label="Cinematic tunnel">
      <div className="sticky top-0 h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
        {/* atmospheric backdrop */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(60% 50% at 50% 50%, var(--atmo-1), transparent 70%), radial-gradient(40% 40% at 50% 55%, var(--atmo-2), transparent 70%)" }} />

        {/* BLURRED LAYER — corridor only */}
        <div ref={blurRef} className="absolute inset-0 will-change-[filter,transform,opacity]" style={{ transformOrigin: "50% 50%", opacity: 0.32 }}>
          <div className="absolute inset-0" style={{ perspective: "820px", perspectiveOrigin: "50% 50%" }}>
            <div ref={corridorRef} className="absolute inset-0 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
              {screens.map((s, i) => (
                <Screen key={i} ref={(el) => { screenRefs.current[i] = el; }} {...s} />
              ))}
              {/* end wall */}
              <div ref={endRef} className="absolute left-1/2 top-1/2 on-image" style={{ transform: `translate3d(-50%,-50%,${END_Z}px)`, width: "min(1400px, 140vw)", height: "min(900px, 90vh)", opacity: 0 }}>
                <div className="still deep vignette h-full w-full" style={{ borderRadius: 28 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stories[0].cover} alt="" className="anim-drift" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="label text-accent mb-6">Now arriving</div>
                    <div className="display text-[7vw] md:text-[4.2vw] leading-[1.06] text-ink">Stories<br />Waiting<br />For Cinema</div>
                  </div>
                </div>
              </div>
              {/* rails / guide lines */}
              <Rails />
            </div>
          </div>
          {/* vanishing glow */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(22% 18% at 50% 50%, var(--glow), transparent 100%)" }} />
        </div>

        {/* SHARP LAYER — titles never blur. Composed like a title card: wordmark, a centre mark, a sentence to navigate by. */}
        <div className="absolute inset-0 pointer-events-none">
          {/* phase 0: the title card */}
          <div className={cn("absolute inset-0 transition-all duration-700 ease-cine", phase === 0 ? "opacity-100" : "opacity-0 -translate-y-4")}>
            <div className="absolute inset-x-0 top-[18vh] md:top-[16vh] flex flex-col items-center">
              <Wordmark />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Link href="/discover" className="pointer-events-auto group flex flex-col items-center gap-4 anim-in d-8">
                <span className="relative h-6 w-6 md:h-7 md:w-7" aria-hidden>
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 transition-transform duration-700 group-hover:rotate-90" style={{ background: "var(--text-2)" }} />
                  <span className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2" style={{ background: "var(--text-2)" }} />
                </span>
                <span className="sub group-hover:text-ink transition-colors">Explore stories</span>
              </Link>
            </div>
            <nav className="absolute inset-x-0 bottom-[12vh] md:bottom-[10vh] px-6 pointer-events-auto anim-up d-8" aria-label="Hero">
              <div className="sentence">
                <small>Every</small><Link href="/stories">great film</Link><small>begins with</small><Link href="/create">an idea</Link>
              </div>
              <div className="sentence mt-3 md:mt-4">
                <small>the</small><Link href="/discover">stories</Link><small>and</small><Link href="/cinema">cinema</Link><small>or</small><Link href="/signup">become a creator</Link>
              </div>
            </nav>
          </div>

          {/* phase 1: the corridor speaks */}
          <div className={cn("absolute inset-0 flex items-center justify-center px-6 transition-all duration-700 ease-cine", phase === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
            <div className="text-center max-w-4xl">
              <div className="sub mb-6">The corridor</div>
              <h2 className="display text-[6vw] md:text-[3.2vw] text-ink">Someone, somewhere,<br />is imagining your next favorite film.</h2>
              <p className="sub sub-lg normal-case tracking-[0.06em] mt-6">They just need the tools to bring it out.</p>
            </div>
          </div>

          {/* phase 2: arrival */}
          <div className={cn("absolute bottom-[12vh] left-0 right-0 px-6 md:px-14 flex items-end justify-between transition-all duration-700 ease-cine", phase === 2 ? "opacity-100" : "opacity-0 pointer-events-none")}>
            <div className="sub">12 stories · 8 creators · 6 films in development</div>
            <div className="sub hidden md:block">Keep scrolling</div>
          </div>

          {/* HUD: velocity meter */}
          <div className="absolute bottom-6 left-6 md:left-14 flex items-center gap-4 sub">
            <span className="hidden sm:inline">Velocity</span>
            <span className="bar w-24"><span style={{ width: `${Math.min(100, hud.v * 25)}%`, transition: "width 120ms linear" }} /></span>
            <span className="tabular-nums w-10">{Math.round(hud.p * 100)}%</span>
          </div>
          <div className="absolute bottom-6 right-6 md:right-14 sub hidden md:block">Blur follows scroll velocity, not position</div>
        </div>
      </div>
    </section>
  );
}


const Screen = forwardRef<HTMLDivElement, { z: number; wall: Wall; story: (typeof stories)[number]; i: number }>(function Screen({ z, wall, story, i }, ref) {
  const w = "min(620px, 78vw)", h = "min(350px, 44vw)";
  const lateral = i % 2 === 0 ? 0 : (wall === "T" || wall === "B" ? (i % 4 === 1 ? -220 : 220) : 0);
  const transform =
    wall === "L" ? `translate3d(calc(-50% - 44vw), -50%, ${z}px) rotateY(90deg)` :
    wall === "R" ? `translate3d(calc(-50% + 44vw), -50%, ${z}px) rotateY(-90deg)` :
    wall === "T" ? `translate3d(calc(-50% + ${lateral}px), calc(-50% - 36vh), ${z}px) rotateX(-90deg)` :
                   `translate3d(calc(-50% + ${lateral}px), calc(-50% + 36vh), ${z}px) rotateX(90deg)`;
  const author = authorById(story.authorId);
  return (
    <div ref={ref} className="absolute left-1/2 top-1/2 will-change-[opacity] on-image" style={{ width: w, height: h, transform, backfaceVisibility: "hidden", opacity: 0 }}>
      <div className="still vignette h-full w-full border border-line" style={{ borderRadius: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={story.cover} alt="" loading={i < 8 ? "eager" : "lazy"} />
        <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between z-[2]">
          <div>
            <div className="label-sm text-ink-3">{story.genre} · {story.format}</div>
            <div className="display text-xl text-ink mt-2">{story.title}</div>
            <div className="text-xs text-ink-2 mt-1">{author.name}</div>
          </div>
          <div className="text-right">
            <div className="numeral text-3xl text-accent">{story.screenability}%</div>
            <div className="label-sm text-ink-3">screenable</div>
          </div>
        </div>
      </div>
    </div>
  );
});

function Wordmark() {
  const letters = "BORN CINEMA".split("");
  return (
    <div className="flex flex-col items-center">
      <div className="display text-[1.35rem] md:text-[1.8rem] text-ink" style={{ letterSpacing: "0.42em" }} aria-label="Born Cinema">
        {letters.map((l, i) => <span key={i} className="inline-block anim-in" style={{ animationDelay: `${200 + i * 70}ms` }}>{l === " " ? "\u00A0" : l}</span>)}
      </div>
      <div className="sub mt-3 anim-in d-8">Where cinema is born</div>
    </div>
  );
}

function Rails() {
  const lines = Array.from({ length: 6 });
  return (
    <>
      {lines.map((_, i) => (
        <div key={i} className="absolute left-1/2 top-1/2" style={{ width: 2, height: DEPTH + 1600, transformOrigin: "50% 0%", transform: `translate3d(-50%, -50%, 0) rotateX(90deg) translate3d(${(i - 2.5) * 30}vw, 0, ${-36}vh)`, background: "linear-gradient(180deg, transparent, var(--line) 30%, var(--line) 70%, transparent)", opacity: 0.6 }} />
      ))}
    </>
  );
}
