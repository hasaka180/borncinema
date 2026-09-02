"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, reduceMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Cinematic fade-in: a soft blur resolving as the element rises into view. */
export function Reveal({ children, className, delay = 0, as: Tag = "div", y = 28 }: { children: React.ReactNode; className?: string; delay?: number; as?: any; y?: number }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el || reduceMotion()) return;
    const tween = gsap.fromTo(el, { autoAlpha: 0, y, filter: "blur(10px)" }, {
      autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.25, ease: "power3.out", delay: delay / 1000,
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [delay, y]);
  return <Tag ref={ref} className={cn("reveal", className)}>{children}</Tag>;
}

export { ScrollTrigger };
