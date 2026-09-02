"use client";
import { useEffect, useState } from "react";
import { getAIStatus } from "@/lib/ai";

/** Tells the creator, honestly, which partner is answering. */
export function AIBadge({ className = "" }: { className?: string }) {
  const [s, setS] = useState<{ configured: boolean; model: string } | null>(null);
  useEffect(() => { getAIStatus().then(setS); }, []);
  return (
    <span className={`inline-flex items-center gap-2 label-sm text-ink-3 ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s?.configured ? "bg-accent" : "bg-ink-3"}`} />
      {s === null ? "Checking partner…" : s.configured ? `OpenAI · ${s.model}` : "Local creative partner · add OPENAI_API_KEY to enable the model"}
    </span>
  );
}
