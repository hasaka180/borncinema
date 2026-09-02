export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return `${mo}mo ago`;
}

export function pick<T>(arr: T[], n: number, seed = Math.random()): T[] {
  const copy = [...arr];
  let s = seed * 9301 + 49297;
  const out: T[] = [];
  while (copy.length && out.length < n) {
    s = (s * 9301 + 49297) % 233280;
    const i = Math.floor((s / 233280) * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
