"use client";
import { useEffect, useRef, useState } from "react";
import { ai } from "@/lib/ai";
import type { Suggestion } from "@/lib/ai/types";
import { useProject } from "@/store/project";
import { cn } from "@/lib/utils";
import { AIBadge } from "./AIBadge";

interface Msg { role: "you" | "partner"; text: string; options?: Suggestion[] }
const QUICK = ["Give me three darker endings.", "Make the protagonist more morally complicated.", "I want this to feel like a slow-burn thriller.", "Suggest a location that would make this more visually interesting.", "Does this plot have a logical problem?", "Give me five character names that fit this world.", "Turn this chapter into a cinematic scene.", "Show me what is missing from this story."];

export function StoryPartner({ open, onClose, onApply }: { open: boolean; onClose: () => void; onApply?: (text: string) => void }) {
  const { ctx, dispatch } = useProject();
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "partner", text: "I know this project. Ask me anything about it, or push back on something I suggested. I won't just agree." }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, open]);

  const ask = async (q: string) => {
    if (!q.trim() || busy) return;
    setMsgs((m) => [...m, { role: "you", text: q }]);
    setInput(""); setBusy(true);
    const r = await ai.text.partner(ctx, q);
    setMsgs((m) => [...m, { role: "partner", text: r.text, options: r.options }]);
    setBusy(false);
  };

  return (
    <div className={cn("fixed inset-y-0 sm:inset-y-4 right-0 sm:right-4 z-50 w-full sm:w-[440px] flex flex-col transition-transform duration-700 ease-cine panel", open ? "translate-x-0" : "translate-x-[110%]")} aria-hidden={!open}>
      <div className="flex items-center justify-between px-6 py-5 rule">
        <div><div className="label-sm text-accent">The Story Partner</div><div className="display text-xl mt-1">Thinking with you</div></div>
        <button onClick={onClose} className="label text-ink-3 hover:text-ink">Close</button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {msgs.map((m, i) => (
          <div key={i} className={cn("anim-up", m.role === "you" && "pl-10")}>
            <div className="label-sm text-ink-3 mb-2">{m.role === "you" ? "You" : "Partner"}</div>
            <p className={cn("serif leading-snug", m.role === "you" ? "text-ink-2 text-lg italic" : "text-ink text-[1.15rem]")}>{m.text}</p>
            {m.options && (
              <div className="mt-3 space-y-2">
                {m.options.map((o) => (
                  <button key={o.id} onClick={() => { dispatch({ type: "choice", text: o.text }); onApply?.(o.text); setMsgs((ms) => [...ms, { role: "partner", text: `Noted. “${o.text}” is now part of the project's memory. I'll lean that way from here.` }]); }} className="suggestion !py-3 !px-4 text-left w-full">
                    <span className="serif text-lg text-ink">{o.text}</span>{o.detail && <span className="block serif italic text-ink-2 text-sm mt-1">{o.detail}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && <div className="label-sm text-ink-3 animate-pulse">Partner is thinking…</div>}
        <div ref={end} />
      </div>
      <div className="px-6 py-4 rule">
        <div className="flex gap-2 overflow-x-auto hide-scroll pb-3 -mx-6 px-6">{QUICK.map((q) => <button key={q} onClick={() => ask(q)} className="chip shrink-0">{q}</button>)}</div>
        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-3">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask, or argue." className="input text-base" />
          <button className="btn btn-sm btn-primary shrink-0" disabled={busy || !input.trim()}>Send</button>
        </form>
        <div className="mt-3"><AIBadge /></div>
      </div>
    </div>
  );
}
