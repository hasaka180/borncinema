"use client";
import { cn, fmt } from "@/lib/utils";

export function ScreenabilityMeter({ value, size = "sm", label = true, className }: { value: number; size?: "sm" | "md" | "lg"; label?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className={cn("numeral text-accent", size === "lg" ? "text-7xl md:text-8xl" : size === "md" ? "text-4xl" : "text-2xl")}>{value}%</span>
      {label && (
        <span className="flex flex-col gap-1.5">
          <span className="label-sm text-ink-3">Screenability</span>
          <span className={cn("bar", size === "lg" ? "w-40" : size === "md" ? "w-28" : "w-16")}><span style={{ width: `${value}%` }} /></span>
        </span>
      )}
    </div>
  );
}

export function SignalRow({ signals, className }: { signals: { label: string; value: number; suffix?: string }[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-3 md:grid-cols-6 gap-y-6", className)}>
      {signals.map((s) => (
        <div key={s.label}>
          <div className="numeral text-3xl text-ink">{s.suffix ? s.value + s.suffix : fmt(s.value)}</div>
          <div className="label-sm text-ink-3 mt-2">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
