"use client";
import { useEffect, useRef, useState } from "react";
import { Still } from "@/components/ui/Still";
import { cn } from "@/lib/utils";

/** Cinematic preview: storyboard frames + Ken Burns motion + cross dissolves + text overlays + a sound placeholder. */
export function PreviewPlayer({ frames, title, captions = [], palette = [], note }: { frames: string[]; title: string; captions?: string[]; palette?: string[]; note?: string }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const timer = useRef<number | null>(null);
  const DUR = 4200;

  useEffect(() => {
    if (!playing) { if (timer.current) window.clearTimeout(timer.current); return; }
    timer.current = window.setTimeout(() => setI((x) => (x + 1) % frames.length), DUR);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [playing, i, frames.length]);

  return (
    <div className="relative overflow-hidden border border-line" style={{ background: "#000" }}>
      <div className="relative aspect-video">
        {frames.map((f, k) => (
          <div key={k} className={cn("absolute inset-0 transition-opacity duration-[1400ms] ease-cine", k === i ? "opacity-100" : "opacity-0")}>
            <Still src={f} alt="" deep className="h-full w-full" imgClassName={cn(playing && k === i && "anim-slow-zoom")} />
          </div>
        ))}
        {/* letterbox */}
        <div className="absolute inset-x-0 top-0 h-[8%] bg-black" /><div className="absolute inset-x-0 bottom-0 h-[8%] bg-black" />
        {/* overlays */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
          <div className="flex justify-between label-sm text-white/60">
            <span>{title}</span><span>{String(i + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}</span>
          </div>
          <div>
            {captions[i % captions.length] && <p key={i} className="serif italic text-white text-lg md:text-3xl max-w-2xl leading-snug anim-up drop-shadow">{captions[i % captions.length]}</p>}
          </div>
        </div>
        {!playing && (
          <button onClick={() => setPlaying(true)} className="absolute inset-0 flex items-center justify-center group" aria-label="Play preview">
            <span className="h-20 w-20 rounded-full border border-white/50 flex items-center justify-center text-white text-2xl group-hover:bg-white group-hover:text-black transition-colors">▶</span>
          </button>
        )}
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t border-line" style={{ background: "var(--bg)" }}>
        <div className="flex items-center gap-4">
          <button onClick={() => setPlaying((p) => !p)} className="label text-ink hover:text-accent">{playing ? "Pause" : "Play"}</button>
          <button onClick={() => setI((x) => (x + 1) % frames.length)} className="label text-ink-3 hover:text-ink">Next</button>
          <button onClick={() => setMuted((m) => !m)} className="label text-ink-3 hover:text-ink">{muted ? "Sound: off" : "Sound: placeholder"}</button>
        </div>
        <div className="flex gap-1">{frames.map((_, k) => <button key={k} onClick={() => setI(k)} className="h-1.5 w-6" style={{ background: k === i ? "var(--accent)" : "var(--line)" }} aria-label={`Frame ${k + 1}`} />)}</div>
        <div className="hidden md:flex gap-px">{palette.map((c) => <span key={c} className="h-4 w-4" style={{ background: c }} />)}</div>
      </div>
      {note && <p className="label-sm text-ink-3 px-4 py-2 border-t border-line">{note}</p>}
    </div>
  );
}
