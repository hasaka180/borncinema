"use client";
import { useEffect, useState } from "react";

const WORDS = ["Every", "great", "film", "begins", "with", "an", "idea"];

/**
 * The reference's entrance: a black veil, words stepping down a diagonal,
 * click anywhere to enter. Shown once per session.
 */
export function IntroVeil() {
  const [state, setState] = useState<"hidden" | "shown" | "leaving">("hidden");
  useEffect(() => {
    try {
      if (sessionStorage.getItem("bc-intro") === "1") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    } catch { return; }
    setState("shown");
    document.documentElement.classList.add("lenis-stopped");
  }, []);
  const enter = () => {
    if (state !== "shown") return;
    setState("leaving");
    try { sessionStorage.setItem("bc-intro", "1"); } catch {}
    document.documentElement.classList.remove("lenis-stopped");
  };
  if (state === "hidden") return null;
  return (
    <div className={`intro-veil ${state === "leaving" ? "leaving" : ""}`} onClick={enter} role="button" aria-label="Enter Born Cinema" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") enter(); }}>
      <div className="intro-words" aria-hidden>
        {WORDS.map((w, i) => (
          <span key={w} style={{ marginLeft: `${i * 2.2}em`, animationDelay: `${300 + i * 140}ms` }}>{w}</span>
        ))}
      </div>
      <button onClick={enter} className="absolute bottom-8 left-1/2 -translate-x-1/2 sub hover:text-ink transition-colors underline underline-offset-[6px] decoration-[0.5px]">Enter</button>
    </div>
  );
}
