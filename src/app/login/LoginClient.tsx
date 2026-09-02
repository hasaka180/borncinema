"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Still } from "@/components/ui/Still";
import { Logo } from "@/components/ui/Logo";
import { IMG } from "@/lib/data";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

const DEMO = [
  { handle: "maravoss", name: "Mara Voss", role: "Creator" },
  { handle: "tariqel", name: "Tariq El-Amin", role: "Creator" },
  { handle: "editorial", name: "Editorial Desk", role: "Superadmin" },
];

export function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const signIn = async (body: Record<string, string>, key: string) => {
    setBusy(key); setErr(null);
    const r = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) { setErr(r.status === 401 ? "Email or password is wrong." : "That account could not be opened."); setBusy(null); return; }
    router.push(next); router.refresh();
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12">
      <div className="relative lg:col-span-6 min-h-[38vh] on-image">
        <Still src={IMG.projector} alt="" deep zoom className="absolute inset-0 rounded-none" />
        <div className="relative h-full p-8 md:p-14 flex flex-col justify-between">
          <Link href="/"><Logo /></Link>
          <div>
            <div className="label text-accent mb-3">Members</div>
            <h1 className="display text-xl md:text-5xl text-ink">Where your stories live.</h1>
            <p className="serif italic text-ink-2 text-lg mt-4 max-w-md">Write with the Story Partner, submit to the desk, and watch readers decide what deserves to become cinema.</p>
          </div>
        </div>
      </div>
      <div className="lg:col-span-6 p-8 md:p-14 flex flex-col justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex justify-end mb-10"><ThemeSwitcher /></div>
        <div className="max-w-md w-full mx-auto">
          <div className="display text-lg md:text-xl text-ink">Sign in</div>
          <form noValidate onSubmit={(e) => { e.preventDefault(); signIn({ email, password }, "email"); }} className="mt-8 space-y-6">
            <label className="block"><span className="label-sm text-ink-3">Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="input mt-1" placeholder="you@example.com" /></label>
            <label className="block"><span className="label-sm text-ink-3">Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="input mt-1" placeholder="••••••••" /></label>
            {err && <p className="serif italic text-accent text-sm">{err}</p>}
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">New here? <Link href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-accent">Become a creator</Link></span>
              <button className="btn btn-primary" disabled={!!busy || !email || !password}>{busy === "email" ? "Opening…" : "Sign in"}</button>
            </div>
          </form>

          <div className="rule mt-10 pt-6">
            <button onClick={() => setShowDemo((s) => !s)} className="label-sm text-ink-3 hover:text-ink">{showDemo ? "Hide demo accounts" : "Or open a demo account →"}</button>
            {showDemo && (
              <div className="mt-4 space-y-2 anim-up">
                {DEMO.map((a) => (
                  <button key={a.handle} onClick={() => signIn({ handle: a.handle }, a.handle)} disabled={!!busy} className="card-edit w-full text-left px-5 py-4 flex items-center gap-4 hover:border-accent transition-colors">
                    <span className="h-8 w-8 rounded-full gradient-fallback shrink-0 border border-line" />
                    <span className="flex-1 min-w-0"><span className="block text-sm text-ink">{a.name}</span><span className="block label-sm text-ink-3 mt-0.5">{a.role}</span></span>
                    <span className="label-sm text-accent">{busy === a.handle ? "Opening…" : "Enter →"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="label-sm text-ink-3 mt-8">Prototype sign-in: hashed passwords, signed cookie sessions, no password reset yet.</p>
        </div>
      </div>
    </div>
  );
}
