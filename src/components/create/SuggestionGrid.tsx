"use client";
import { useState } from "react";
import type { Suggestion } from "@/lib/ai/types";
import { cn } from "@/lib/utils";

interface Props {
  items: Suggestion[];
  loading?: boolean;
  selected?: string;
  onUse: (text: string) => void;
  onMore?: (hint?: string) => void;
  onDescribe?: (hint: string) => void;
  describePlaceholder?: string;
  ownPlaceholder?: string;
  compact?: boolean;
}

/** Every suggestion: USE THIS · EDIT · MORE LIKE THIS. Always: WRITE MY OWN. */
export function SuggestionGrid({ items, loading, selected, onUse, onMore, onDescribe, describePlaceholder = "Describe what I'm looking for…", ownPlaceholder = "Write my own…", compact }: Props) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [own, setOwn] = useState("");
  const [describe, setDescribe] = useState("");
  const [showDescribe, setShowDescribe] = useState(false);
  const [showOwn, setShowOwn] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="label-sm text-ink-3">{loading ? "Thinking…" : "Suggestions"}</div>
        <div className="flex gap-4 label-sm">
          {onMore && <button onClick={() => onMore()} className="text-ink-3 hover:text-ink" disabled={loading}>Generate more</button>}
          {onDescribe && <button onClick={() => setShowDescribe((s) => !s)} className="text-ink-3 hover:text-ink">Describe what I'm looking for</button>}
        </div>
      </div>

      {showDescribe && onDescribe && (
        <form onSubmit={(e) => { e.preventDefault(); if (describe.trim()) { onDescribe(describe.trim()); } }} className="flex gap-3 mb-6 anim-up">
          <input autoFocus value={describe} onChange={(e) => setDescribe(e.target.value)} placeholder={describePlaceholder} className="input" />
          <button className="btn btn-sm shrink-0" disabled={!describe.trim() || loading}>Refine</button>
        </form>
      )}

      <div className={cn("grid gap-3", compact ? "sm:grid-cols-2" : "sm:grid-cols-2")}>
        {loading && items.length === 0 && Array.from({ length: 4 }).map((_, i) => <div key={i} className="suggestion h-24 animate-pulse" style={{ animationDelay: `${i * 120}ms`, opacity: 0.5 }} />)}
        {items.map((s, i) => {
          const isEditing = editing === s.id;
          return (
            <div key={s.id} className={cn("suggestion group anim-up", selected === s.text && "selected")} style={{ animationDelay: `${i * 90}ms` }} onClick={() => !isEditing && onUse(s.text)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" && !isEditing) onUse(s.text); }}>
              {isEditing ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <input autoFocus value={editText} onChange={(e) => setEditText(e.target.value)} className="input text-lg" onKeyDown={(e) => { if (e.key === "Enter") { onUse(editText); setEditing(null); } if (e.key === "Escape") setEditing(null); }} />
                  <div className="flex gap-3 mt-3 label-sm"><button onClick={() => { onUse(editText); setEditing(null); }} className="text-accent">Use this</button><button onClick={() => setEditing(null)} className="text-ink-3">Cancel</button></div>
                </div>
              ) : (
                <>
                  <div className={cn("serif text-ink leading-snug", compact ? "text-xl" : "text-2xl")}>{s.text}</div>
                  {s.detail && <div className="serif italic text-ink-2 text-sm mt-2 leading-snug">{s.detail}</div>}
                  <div className="flex gap-4 mt-4 label-sm text-ink-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onUse(s.text)} className="hover:text-accent text-accent">Use this</button>
                    <button onClick={() => { setEditing(s.id); setEditText(s.text); }} className="hover:text-ink">Edit</button>
                    {onMore && <button onClick={() => onMore(s.text)} className="hover:text-ink">More like this</button>}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        {!showOwn ? (
          <button onClick={() => setShowOwn(true)} className="btn btn-ghost">Write my own <span aria-hidden>→</span></button>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (own.trim()) onUse(own.trim()); }} className="flex gap-3 anim-up">
            <input autoFocus value={own} onChange={(e) => setOwn(e.target.value)} placeholder={ownPlaceholder} className="input" />
            <button className="btn btn-sm btn-primary shrink-0" disabled={!own.trim()}>Use mine</button>
          </form>
        )}
      </div>
    </div>
  );
}
