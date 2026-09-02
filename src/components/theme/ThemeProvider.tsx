"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { THEMES, type ThemeKey } from "./themes";
export { THEMES };
export type { ThemeKey };

interface Ctx { theme: ThemeKey; setTheme: (t: ThemeKey) => void; transitioning: boolean }
const ThemeCtx = createContext<Ctx>({ theme: "night", setTheme: () => {}, transitioning: false });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeKey>("night");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bc-theme") as ThemeKey | null;
      if (saved && THEMES.some((t) => t.key === saved)) {
        setThemeState(saved);
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {}
  }, []);

  const setTheme = useCallback((t: ThemeKey) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.documentElement.setAttribute("data-theme", t);
      setThemeState(t);
      try { localStorage.setItem("bc-theme", t); } catch {}
      return;
    }
    setTransitioning(true);
    window.setTimeout(() => {
      document.documentElement.setAttribute("data-theme", t);
      setThemeState(t);
      try { localStorage.setItem("bc-theme", t); } catch {}
      window.setTimeout(() => setTransitioning(false), 350);
    }, 380);
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, transitioning }}>
      {children}
      <div className={`theme-veil ${transitioning ? "active" : ""}`} aria-hidden />
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
