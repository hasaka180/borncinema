"use client";
import { useEffect, useRef, useState } from "react";
import { THEMES, useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const current = THEMES.find((t) => t.key === theme)!;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 label text-ink-2 hover:text-ink transition-colors"
        aria-haspopup="menu" aria-expanded={open} aria-label="Change atmosphere"
      >
        <span className="relative h-3.5 w-3.5 rounded-full overflow-hidden border border-line-strong" style={{ background: `linear-gradient(135deg, ${current.swatch[0]} 50%, ${current.swatch[2]} 50%)` }} />
        {!compact && <span>{current.label}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-4 w-[300px] panel p-4 z-50 anim-up" role="menu">
          <div className="label-sm text-ink-3 mb-3">Atmosphere</div>
          <div className="space-y-1">
            {THEMES.map((t) => (
              <button
                key={t.key} role="menuitem"
                onClick={() => { setTheme(t.key); setOpen(false); }}
                className={cn("w-full flex items-center gap-4 px-2 py-2.5 text-left transition-colors hover:bg-bg-2", theme === t.key && "bg-bg-2")}
              >
                <span className="relative h-9 w-14 overflow-hidden rounded-lg border border-line shrink-0" style={{ background: t.swatch[0] }}>
                  <span className="absolute inset-y-0 left-0 w-[45%]" style={{ background: `linear-gradient(90deg, ${t.swatch[1]}, transparent)` }} />
                  <span className="absolute bottom-1.5 left-1.5 h-[3px] w-6" style={{ background: t.swatch[2] }} />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full" style={{ background: t.swatch[3], opacity: .8 }} />
                </span>
                <span className="flex-1">
                  <span className="block label text-ink">{t.label}</span>
                  <span className="block serif italic text-sm text-ink-2 mt-1">{t.feel}</span>
                </span>
                {theme === t.key && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
              </button>
            ))}
          </div>
          <div className="rule mt-3 pt-3 serif italic text-xs text-ink-3">The color changes. The cinema does not.</div>
        </div>
      )}
    </div>
  );
}
