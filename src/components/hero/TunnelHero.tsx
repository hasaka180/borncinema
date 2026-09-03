"use client";
import Link from "next/link";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { stories, authorById } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * CINEMATIC TUNNEL
 * Scroll flies the camera down a corridor of screens. Scroll VELOCITY, not position,
 * drives the motion blur, so hard scrubbing smears the corridor while the titles,
 * which live in their own unfiltered layer, stay sharp.
 *
 * Geometry: a scattered cloud of small screens, each yawed to face the centre, spread
 * through a ring so the middle of the frame stays clear. Depth wraps, so the corridor
 * never runs out and nothing pops in or out.
 */

const COUNT = 40;
const SPACING = 265;
const DEPTH = COUNT * SPACING;
const PERSPECTIVE = 1000;
const NEAR_FADE = 340;

/** The panes are small; ask the CDN for small art so decode and compositing stay cheap. */
const thumb = (url: string) => url.replace(/([?&])w=\d+/, "$1w=420").replace(/([?&])q=\d+/, "$1q=55");

type Screen = {
  x: number; y: number; z: number; yaw: number;
  w: number; h: number;
  story: (typeof stories)[number];
};

/** Deterministic scatter so server and client agree. */
function build(count: number): Screen[] {
  let seed = 20260903;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const out: Screen[] = [];
  for (let i = 0; i < count; i++) {
    // golden angle keeps the ring evenly covered instead of clumping
    const angle = i * 2.3999632 + rnd() * 0.5;
    const radius = 360 + rnd() * 720;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius * 0.66;
    const w = 170 + rnd() * 210;
    out.push({
      x, y,
      z: -(i * SPACING + rnd() * SPACING * 0.5),
      yaw: Math.max(-46, Math.min(46, -x / 16)),
      w, h: Math.round(w * 0.62),
      story: stories[i % stories.length],
    });
  }
  return out;
}

export function TunnelHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [phase, setPhase] = useState(0);
  const [reduce, setReduce] = useState(false);
  const [hud, setHud] = useState({ p: 0, v: 0 });

  const screens = useMemo(() => build(COUNT), []);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (rm.matches) { setReduce(true); return; }

    let raf = 0;
    // narrow viewports pull the cloud inward so it never sits on the titles
    let k = Math.max(0.42, Math.min(1, window.innerWidth / 1440));
    const onResize = () => {
      k = Math.max(0.42, Math.min(1, window.innerWidth / 1440));
      refs.current.forEach((n, i) => {
        if (!n) return;
        const sc = screens[i];
        n.style.width = `${sc.w * k}px`;
        n.style.height = `${sc.h * k}px`;
        n.style.marginLeft = `${(-sc.w * k) / 2}px`;
        n.style.marginTop = `${(-sc.h * k) / 2}px`;
      });
    };
    onResize();
    window.addEventListener("resize", onResize);

    let lastY = window.scrollY;
    let lastT = performance.now();
    let vel = 0;
    let prevPhase = -1;
    let tick = 0;
    const blurCache = new Float32Array(screens.length).fill(-1);

    const frame = (t: number) => {
      const el = sectionRef.current;
      const stage = stageRef.current;
      if (!el || !stage) { raf = requestAnimationFrame(frame); return; }

      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, travel)));

      // smoothed scroll velocity, px per ms
      const y = window.scrollY;
      const dt = Math.max(8, t - lastT);
      const inst = (y - lastY) / dt;
      lastY = y; lastT = t;
      vel += (inst - vel) * 0.16;
      const speed = Math.abs(vel) < 0.001 ? 0 : Math.abs(vel);

      const blur = Math.min(11, speed * 6);
      const camZ = p * DEPTH * 1.9;

      for (let i = 0; i < screens.length; i++) {
        const node = refs.current[i];
        if (!node) continue;
        const s = screens[i];

        // wrap depth into [-DEPTH, 0): the corridor loops forever
        const raw = s.z + camZ;
        const z = ((raw % DEPTH) + DEPTH) % DEPTH - DEPTH;

        // fade in from the far end, fade out as it sweeps past the camera
        const far = 1 - Math.max(0, (-z - DEPTH * 0.55) / (DEPTH * 0.45));
        const near = Math.min(1, -z / NEAR_FADE);
        const o = Math.max(0, Math.min(1, far)) * near * 0.92;

        node.style.transform = `translate3d(${s.x * k}px, ${s.y * k}px, ${z}px) rotateY(${s.yaw}deg)`;
        node.style.opacity = o.toFixed(3);

        // per-screen blur, quantised so we only touch style when it actually changes
        const q = Math.round(blur * 2) / 2;
        if (blurCache[i] !== q) {
          blurCache[i] = q;
          node.style.filter = q > 0.4 ? `blur(${q}px)` : "";
        }
      }

      const ph = p < 0.34 ? 0 : p < 0.74 ? 1 : 2;
      if (ph !== prevPhase) { prevPhase = ph; setPhase(ph); }
      if (++tick % 6 === 0) setHud({ p, v: speed });

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, [screens]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: reduce ? "100vh" : "460vh" }}
      aria-label="Cinematic tunnel"
    >
      <div className="sticky top-0 h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(60% 50% at 50% 50%, var(--atmo-1), transparent 70%), radial-gradient(40% 40% at 50% 55%, var(--atmo-2), transparent 70%)" }}
        />

        {/* CORRIDOR */}
        <div className="absolute inset-0" style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
          <div ref={stageRef} className="absolute left-1/2 top-1/2" style={{ transformStyle: "preserve-3d" }}>
            {screens.map((s, i) => (
              <ScreenPane key={i} ref={(el) => { refs.current[i] = el; }} screen={s} eager={i < 10} reduce={reduce} index={i} />
            ))}
          </div>
        </div>

        {/* vanishing glow and a soft scrim: the corridor stays visible, the titles stay readable */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(26% 22% at 50% 50%, var(--glow), transparent 100%)" }} />
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{ background: "radial-gradient(38% 30% at 50% 50%, var(--bg) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 55%, transparent 100%)", opacity: phase === 2 ? 0 : 0.8 }}
        />

        {/* edge scrims: the corridor fades out where the type lives */}
        <div className="absolute inset-x-0 top-0 h-[26vh] pointer-events-none" style={{ background: "linear-gradient(180deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 55%, transparent) 55%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0 h-[30vh] pointer-events-none" style={{ background: "linear-gradient(0deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 62%, transparent) 55%, transparent 100%)" }} />

        {/* SHARP LAYER — titles never blur */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn("absolute inset-0 transition-all duration-700 ease-cine", phase === 0 ? "opacity-100" : "opacity-0 -translate-y-4")}>
            <div className="absolute inset-x-0 top-[18vh] md:top-[16vh] flex flex-col items-center"><Wordmark /></div>
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

          <div className={cn("absolute inset-0 flex items-center justify-center px-6 transition-all duration-700 ease-cine", phase === 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")}>
            <div className="text-center max-w-4xl">
              <div className="sub mb-6">The corridor</div>
              <h2 className="display text-[6vw] md:text-[3.2vw] text-ink">Someone, somewhere,<br />is imagining your next favorite film.</h2>
              <p className="sub sub-lg normal-case tracking-[0.06em] mt-6">They just need the tools to bring it out.</p>
            </div>
          </div>

          <div className={cn("absolute bottom-[12vh] left-0 right-0 px-6 md:px-14 flex items-end justify-between transition-all duration-700 ease-cine", phase === 2 ? "opacity-100" : "opacity-0 pointer-events-none")}>
            <div className="sub">12 stories · 8 creators · 6 films in development</div>
            <div className="sub hidden md:block">Keep scrolling</div>
          </div>

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

const ScreenPane = forwardRef<HTMLDivElement, { screen: Screen; eager: boolean; reduce: boolean; index: number }>(
  function ScreenPane({ screen, eager, reduce, index }, ref) {
    const { story } = screen;
    const author = authorById(story.authorId);
    return (
      <div
        ref={ref}
        className="absolute on-image"
        style={{
          width: screen.w,
          height: screen.h,
          marginLeft: -screen.w / 2,
          marginTop: -screen.h / 2,
          transform: reduce
            ? `translate3d(${screen.x}px, ${screen.y}px, ${screen.z / 6}px) rotateY(${screen.yaw}deg)`
            : `translate3d(${screen.x}px, ${screen.y}px, ${screen.z}px) rotateY(${screen.yaw}deg)`,
          opacity: reduce ? 0.5 : 0,
          backfaceVisibility: "hidden",
          willChange: "transform, opacity",
          contain: "layout paint style",
        }}
        aria-hidden
      >
        <div className="still vignette h-full w-full border border-line" style={{ borderRadius: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb(story.cover)} alt="" loading={eager ? "eager" : "lazy"} decoding="async" draggable={false} />
          <div className="absolute inset-x-0 bottom-0 p-2.5 z-[2]">
            <div className="display text-[0.62rem] leading-tight text-ink truncate">{story.title}</div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-[0.5rem] text-ink-3 truncate">{author.name}</span>
              <span className="numeral text-[0.6rem] text-accent">{story.screenability}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

function Wordmark() {
  const letters = "BORN CINEMA".split("");
  return (
    <div className="flex flex-col items-center">
      <div className="display text-[1.35rem] md:text-[1.8rem] text-ink" style={{ letterSpacing: "0.42em" }} aria-label="Born Cinema">
        {letters.map((l, i) => (
          <span key={i} className="inline-block anim-in" style={{ animationDelay: `${200 + i * 70}ms` }}>
            {l === " " ? " " : l}
          </span>
        ))}
      </div>
      <div className="sub mt-3 anim-in d-8">Where cinema is born</div>
    </div>
  );
}
