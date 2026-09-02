"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { cn } from "@/lib/utils";

export interface ShellUser { id: string; name: string; handle: string; role: "creator" | "superadmin" }

const Icon = ({ d, className }: { d: string; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={cn("h-[18px] w-[18px]", className)}><path d={d} /></svg>
);
const I = {
  home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  stories: "M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2zM8 8h6M8 12h6M8 16h4",
  new: "M12 5v14M5 12h14",
  ideas: "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z",
  cinema: "M4 7h16v11H4zM4 7l2-3h12l2 3M8 4l2 3M13 4l2 3",
  review: "M9 12l2 2 4-4M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z",
  moderation: "M12 3l8 4v5c0 5-3.5 9-8 10-4.5-1-8-5-8-10V7zM12 8v5M12 16h.01",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
  site: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  logout: "M10 17l5-5-5-5M15 12H3M21 4v16",
};

export function DashboardShell({ user, children }: { user: ShellUser; children: React.ReactNode }) {
  const path = usePathname() || "";
  const router = useRouter();
  const admin = user.role === "superadmin";
  const items = [
    { href: "/dashboard", label: "Overview", icon: I.home, exact: true },
    { href: "/dashboard/stories", label: "My stories", icon: I.stories },
    { href: "/dashboard/new", label: "New story", icon: I.new },
    { href: "/ideas", label: "Ideas", icon: I.ideas },
    { href: "/cinema/develop", label: "Cinema", icon: I.cinema },
    ...(admin ? [{ href: "/dashboard/review", label: "Review queue", icon: I.review }, { href: "/dashboard/moderation", label: "Moderation", icon: I.moderation }] : []),
    { href: "/dashboard/settings", label: "Settings", icon: I.settings },
  ];
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); };

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <aside className="hidden md:flex w-[92px] lg:w-[240px] shrink-0 flex-col border-r border-line py-7 px-4 lg:px-6 sticky top-0 h-screen">
        <Link href="/" className="px-2 lg:px-1"><span className="lg:hidden display text-xl text-accent">BC</span><span className="hidden lg:block"><Logo /></span></Link>
        <nav className="mt-10 flex-1 space-y-1" aria-label="Dashboard">
          {items.map((it) => {
            const active = it.exact ? path === it.href : path.startsWith(it.href);
            return (
              <Link key={it.href} href={it.href} className={cn("flex items-center gap-3 rounded-full px-3 lg:px-4 py-2.5 transition-colors", active ? "text-accent" : "text-ink-2 hover:text-ink hover:bg-bg-2")} style={{ background: active ? "var(--glow)" : undefined }} title={it.label}>
                <Icon d={it.icon} />
                <span className="hidden lg:inline text-sm">{it.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-3 rounded-full px-3 lg:px-4 py-2.5 text-ink-2 hover:text-ink" title="Back to the site"><Icon d={I.site} /><span className="hidden lg:inline text-sm">Back to the site</span></Link>
          <div className="flex items-center gap-3 px-3 lg:px-4 pt-4 rule">
            <span className="h-8 w-8 rounded-full gradient-fallback border border-line shrink-0" />
            <Link href={`/profile/${user.handle}`} className="hidden lg:block min-w-0 flex-1" title="Public profile"><span className="block text-sm text-ink truncate hover:text-accent transition-colors">{user.name}</span><span className="block label-sm text-ink-3 mt-0.5">{user.role}</span></Link>
            <button onClick={logout} className="text-accent" aria-label="Sign out" title="Sign out"><Icon d={I.logout} /></button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-10 h-16 border-b border-line backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
          <div className="flex items-center gap-4 md:hidden"><Link href="/"><Logo /></Link></div>
          <div className="hidden md:block label-sm text-ink-3">{admin ? "Editorial desk" : "Creator studio"}</div>
          <div className="flex items-center gap-5">
            <ThemeSwitcher />
            <Link href="/dashboard/new" className="btn btn-primary btn-sm">New story</Link>
          </div>
        </header>
        <div className="px-5 md:px-10 py-8 md:py-10">{children}</div>
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 flex justify-around px-2 py-2 border-t border-line backdrop-blur-md" style={{ background: "color-mix(in srgb, var(--bg) 88%, transparent)" }} aria-label="Dashboard">
          {items.slice(0, 5).map((it) => <Link key={it.href} href={it.href} className={cn("p-3 rounded-full", path === it.href ? "text-accent" : "text-ink-2")} title={it.label}><Icon d={it.icon} /></Link>)}
          <button onClick={logout} className="p-3 text-ink-2" aria-label="Sign out"><Icon d={I.logout} /></button>
        </nav>
      </div>
    </div>
  );
}
