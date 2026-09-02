import { cn } from "@/lib/utils";
const MAP: Record<string, [string, string]> = { draft: ["Draft", "text-ink-3"], submitted: ["In review", "text-accent"], published: ["Published", "text-accent-2"], rejected: ["Needs changes", "text-ink-2"] };
export function StatusPill({ status, className }: { status: string; className?: string }) {
  const [label, color] = MAP[status] || [status, "text-ink-3"];
  return <span className={cn("inline-flex items-center gap-2 label-sm rounded-full border border-line px-3 py-1.5 self-start shrink-0 whitespace-nowrap", color, className)}><span className="h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}
