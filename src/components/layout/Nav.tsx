"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { href: "/discover", label: "Discover" },
  { href: "/stories", label: "Stories" },
  { href: "/ideas", label: "Ideas" },
  { href: "/cinema", label: "Cinema" },
  { href: "/community", label: "Community" },
];

export function Nav() {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => { setOpen(false); }, [path]);
  const [me, setMe] = useState<{ name: string; role: string } | null | undefined>(undefined);
  useEffect(() => { fetch("/api/auth/me").then((r) => r.json()).then((d) => setMe(d.user || null)).catch(() => setMe(null)); }, [path]);

  const isReading = path?.startsWith("/story/");

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-700 ease-cine",
          scrolled || open ? "backdrop-blur-md" : "",
          isReading && !scrolled && !open && "on-image",
        )}
        style={{ background: scrolled || open ? "color-mix(in srgb, var(--bg) 82%, transparent)" : "transparent", borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent" }}
      >
        <div className="px-6 md:px-14 h-16 md:h-[72px] flex items-center justify-between gap-6">
          <Link href="/" className="shrink-0" aria-label="Born Cinema home"><Logo /></Link>

          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className={cn("label link-line text-ink-2 hover:text-ink transition-colors", path?.startsWith(l.href) && "text-ink active")}>{l.label}</Link>
            ))}
          </nav>

          <div className="flex items-center gap-5 md:gap-7">
            <Link href="/search" className="hidden md:flex items-center gap-2 label text-ink-2 hover:text-ink transition-colors" aria-label="Search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <span className="hidden xl:inline">Search</span>
            </Link>
            <ThemeSwitcher compact />
            <Link href={me ? "/dashboard/new" : "/create"} className="btn btn-primary btn-sm hidden sm:inline-flex">Create</Link>
            {me ? (
              <Link href="/dashboard" className="hidden md:flex items-center gap-2 label text-ink-2 hover:text-ink transition-colors" aria-label="Your dashboard"><span className="h-7 w-7 rounded-full overflow-hidden border border-line-strong gradient-fallback" /><span className="hidden xl:inline">{me.name.split(" ")[0]}</span></Link>
            ) : me === null ? (
              <span className="hidden md:flex items-center gap-5"><Link href="/login" className="label text-ink-2 hover:text-ink transition-colors">Sign in</Link><Link href="/signup" className="label text-accent hover:text-ink transition-colors">Become a creator</Link></span>
            ) : null}
            <button className="lg:hidden flex flex-col justify-center gap-1.5 h-8 w-8" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
              <span className={cn("block h-px w-6 bg-ink transition-transform duration-500", open && "translate-y-[3.5px] rotate-45")} />
              <span className={cn("block h-px w-6 bg-ink transition-transform duration-500", open && "-translate-y-[3.5px] -rotate-45")} />
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden px-5 pb-8 pt-2 anim-in" style={{ background: "var(--bg)" }}>
            <nav className="flex flex-col" aria-label="Mobile">
              {LINKS.map((l, i) => (
                <Link key={l.href} href={l.href} className={cn("display text-xl py-3 border-b border-line anim-up", `d-${i + 1}`, path?.startsWith(l.href) ? "text-accent" : "text-ink")}>{l.label}</Link>
              ))}
              <div className="flex flex-wrap items-center gap-4 pt-6">
                <Link href="/create" className="btn btn-primary">Start an idea</Link>
                {me ? <Link href="/dashboard" className="btn">Dashboard</Link> : <Link href="/signup" className="btn">Become a creator</Link>}
                <Link href="/search" className="btn">Search</Link>
              </div>
              <div className="flex items-center gap-4 pt-6 label text-ink-2">
                {me ? <Link href="/dashboard">Dashboard</Link> : <Link href="/login">Sign in</Link>}<span>·</span><Link href="/notifications">Notifications</Link><span>·</span><Link href="/profile/maravoss">Profile</Link>
              </div>
            </nav>
          </div>
        )}
      </header>
      {!isReading && <div className="h-16 md:h-[72px]" aria-hidden />}
    </>
  );
}
