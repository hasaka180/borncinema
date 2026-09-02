"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme, type ThemeKey } from "@/components/theme/ThemeProvider";
import type { PublicUser } from "@/lib/server/db";
import { MAKES, CREATOR_GENRES } from "@/lib/creator-options";
import { cn } from "@/lib/utils";

export function SettingsClient({ user, themes, hasPassword }: { user: PublicUser; themes: { key: ThemeKey; label: string; feel: string }[]; hasPassword: boolean }) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [f, setF] = useState({ name: user.name, bio: user.bio || "", location: user.location || "", makes: user.makes || [], genres: user.genres || [] });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const toggle = (k: "makes" | "genres", v: string) => setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v] }));

  const save = async (body: Record<string, unknown>, ok: string) => {
    setBusy(true); setMsg(null); setErr(null);
    const r = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) setErr(Object.values(d.errors || { e: "Could not save." })[0] as string); else { setMsg(ok); setPw({ currentPassword: "", newPassword: "" }); router.refresh(); }
    setBusy(false);
  };

  return (
    <>
      <form noValidate onSubmit={(e) => { e.preventDefault(); save(f, "Profile saved."); }} className="card-edit p-6 space-y-6">
        <div className="flex items-baseline justify-between"><div className="label-sm text-ink-3">Creative profile</div><Link href={`/profile/${user.handle}`} className="label-sm text-accent">View public profile →</Link></div>
        <div className="grid sm:grid-cols-2 gap-6">
          <label className="block"><span className="label-sm text-ink-3">Name</span><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input text-base mt-1" /></label>
          <label className="block"><span className="label-sm text-ink-3">Where are you?</span><input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} className="input text-base mt-1" placeholder="City" /></label>
        </div>
        <label className="block"><span className="label-sm text-ink-3">A line about you</span><textarea value={f.bio} maxLength={280} onChange={(e) => setF({ ...f, bio: e.target.value })} className="input text-base h-20 resize-none mt-1" /></label>
        <div><div className="label-sm text-ink-3 mb-3">I am a…</div><div className="flex flex-wrap gap-2">{MAKES.map((m) => <button type="button" key={m} onClick={() => toggle("makes", m)} className={cn("chip", f.makes.includes(m) && "active")}>{m}</button>)}</div></div>
        <div><div className="label-sm text-ink-3 mb-3">Genres</div><div className="flex flex-wrap gap-2">{CREATOR_GENRES.map((g) => <button type="button" key={g} onClick={() => toggle("genres", g)} className={cn("chip", f.genres.includes(g) && "active")}>{g}</button>)}</div></div>
        <div className="flex items-center justify-between"><span className="serif italic text-sm">{msg && <span className="text-accent">{msg}</span>}{err && <span className="text-accent">{err}</span>}</span><button className="btn btn-primary btn-sm" disabled={busy}>Save profile</button></div>
      </form>

      <div className="card-edit p-6">
        <div className="label-sm text-ink-3 mb-4">Atmosphere</div>
        <div className="flex flex-wrap gap-2">{themes.map((t) => <button key={t.key} onClick={() => setTheme(t.key)} className={cn("chip", theme === t.key && "active")}>{t.label} · {t.feel}</button>)}</div>
      </div>

      <form noValidate onSubmit={(e) => { e.preventDefault(); save(pw, "Password updated."); }} className="card-edit p-6 space-y-5">
        <div className="label-sm text-ink-3">{hasPassword ? "Change password" : "Set a password"}</div>
        {!hasPassword && <p className="serif italic text-ink-2 text-sm">This demo account has no password. Set one to sign in with your email later.</p>}
        <div className="grid sm:grid-cols-2 gap-6">
          {hasPassword && <label className="block"><span className="label-sm text-ink-3">Current password</span><input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" className="input text-base mt-1" /></label>}
          <label className="block"><span className="label-sm text-ink-3">New password</span><input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" className="input text-base mt-1" placeholder="At least 8 characters" /></label>
        </div>
        <div className="flex justify-end"><button className="btn btn-sm" disabled={busy || pw.newPassword.length < 8 || (hasPassword && !pw.currentPassword)}>Update password</button></div>
      </form>
    </>
  );
}
