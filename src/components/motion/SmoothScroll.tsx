"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, reduceMotion } from "@/lib/motion";

declare global { interface Window { __lenis?: Lenis } }

/** Lenis smooth scrolling synced to GSAP's ticker so ScrollTrigger and the tunnel share one clock. */
export function SmoothScroll() {
  const path = usePathname();
  useEffect(() => {
    if (reduceMotion()) return;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1 });
    // in-page anchors ride the smooth scroll too
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href^='#']") as HTMLAnchorElement | null;
      if (!a) return;
      const el = document.querySelector(a.getAttribute("href") || "");
      if (el) { e.preventDefault(); lenis.scrollTo(el as HTMLElement, { offset: -80 }); }
    };
    document.addEventListener("click", onClick);
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { document.removeEventListener("click", onClick); gsap.ticker.remove(tick); lenis.destroy(); window.__lenis = undefined; };
  }, []);
  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  }, [path]);
  return null;
}
