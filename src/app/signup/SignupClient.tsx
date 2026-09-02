"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Still } from "@/components/ui/Still";
import { Logo } from "@/components/ui/Logo";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { IMG } from "@/lib/data";
import { MAKES, CREATOR_GENRES } from "@/lib/creator-options";
import { cn, slugify } from "@/lib/utils";

type Errors = Record<string, string>;

export function SignupClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";
  const [step, setStep] = useState<1 | 2>(1);
  const [f, setF] = useState({ name: "", email: "", password: "", handle: "", location: "", bio: "", makes: [] as string[], genres: [] as string[], agree: false });
  const [touchedHandle, setTouchedHandle] = useState(false);
  const [handleState, setHandleState] = useState<"idle" | "checking" | "ok" | "taken" | "bad">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const timer = useRef<number | null>(null);
  const set = (k: keyof typeof f, v: unknown) => setF((x) => ({ ...x, [k]: v }));
  const toggle = (k: "makes" | "genres", v: string) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);

  // handle follows the name until the creator edits it
  useEffect(() => { if (!touchedHandle) set("handle", slugify(f.name).slice(0, 24)); }, [f.name, touchedHandle]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!f.handle) { setHandleState("idle"); return; }
    if (!/^[a-z0-9][a-z0-9-]{2,23}$/.test(f.handle)) { setHandleState("bad"); return; }
    setHandleState("checking");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const r = await fetch(`/api/auth/handle?h=${encodeURIComponent(f.handle)}`).then((x) => x.json()).catch(() => ({ available: false }));
      setHandleState(r.available ? "ok" : "taken");
    }, 350);
  }, [f.handle]);

  const validateStep1 = () => {
    const e: Errors = {};
    if (f.name.trim().length < 2) e.name = "Tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "That email doesn't look right.";
    if (f.password.length < 8) e.password = "Use at least 8 characters.";
    setErrors(e); return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!f.agree) { setErrors({ agree: "Please agree to the community guidelines." }); return; }
    if (handleState === "taken" || handleState === "bad") { setErrors({ handle: handleState === "taken" ? "That handle is taken." : "Handles are 3–24 characters: letters, numbers, dashes." }); return; }
    setBusy(true); setErrors({});
    const r = await fetch("/api/auth/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, name: f.name.trim(), email: f.email.trim() }) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { setErrors(d.errors || { form: "Something went wrong. Try again." }); setBusy(false); if (d.errors?.name || d.errors?.email || d.errors?.password) setStep(1); return; }
    router.push(next === "/dashboard" ? "/dashboard?welcome=1" : next); router.refresh();
  };

  const strength = f.password.length >= 14 ? 3 : f.password.length >= 10 ? 2 : f.password.length >= 8 ? 1 : 0;

  return (
    <div className="min-h-screen grid lg:grid-cols-12">
      <div className="relative lg:col-span-5 min-h-[34vh] on-image">
        <Still src={IMG.cinema} alt="" deep zoom className="absolute inset-0 rounded-none" />
        <div className="relative h-full p-8 md:p-12 flex flex-col justify-between">
          <Link href="/"><Logo /></Link>
          <div>
            <div className="label text-accent mb-3">Become a creator</div>
            <h1 className="display text-xl md:text-5xl text-ink">The next great film might come from you.</h1>
            <p className="serif italic text-ink-2 text-lg mt-4 max-w-sm">Someone who has never written a screenplay. Someone who has an idea. Someone who simply needs help expressing it.</p>
            <ol className="mt-8 space-y-2 label-sm text-ink-3">
              <li className={cn(step === 1 && "text-ink")}>01 · Your account</li>
              <li className={cn(step === 2 && "text-ink")}>02 · Your creative profile</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 p-8 md:p-14 flex flex-col" style={{ background: "var(--bg)" }}>
        <div className="flex justify-between items-center mb-10"><span className="label-sm text-ink-3">Step {step} of 2</span><ThemeSwitcher /></div>
        <div className="max-w-xl w-full mx-auto flex-1">
          {step === 1 ? (
            <form noValidate onSubmit={(e) => { e.preventDefault(); if (validateStep1()) setStep(2); }} className="space-y-8 anim-up">
              <div><div className="display text-lg md:text-xl text-ink">Who is writing?</div><p className="serif italic text-ink-2 mt-2">Your name appears on every story you publish.</p></div>
              <Field label="Name" error={errors.name}><input value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" className="input" placeholder="Your name" /></Field>
              <Field label="Email" error={errors.email}><input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" className="input" placeholder="you@example.com" /></Field>
              <Field label="Password" error={errors.password} hint={f.password ? ["", "Fine.", "Good.", "Strong."][strength] : "At least 8 characters."}>
                <div className="flex gap-3 items-end">
                  <input type={showPw ? "text" : "password"} value={f.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" className="input" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="label-sm text-ink-3 hover:text-ink pb-3 shrink-0">{showPw ? "Hide" : "Show"}</button>
                </div>
                <div className="flex gap-1 mt-3">{[1, 2, 3].map((i) => <span key={i} className="h-[3px] flex-1 rounded-full transition-colors" style={{ background: strength >= i ? "var(--accent)" : "var(--line)" }} />)}</div>
              </Field>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-ink-2">Already a creator? <Link href="/login" className="text-accent">Sign in</Link></span>
                <button className="btn btn-primary">Continue →</button>
              </div>
            </form>
          ) : (
            <form noValidate onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-8 anim-up">
              <div><div className="display text-lg md:text-xl text-ink">What do you make?</div><p className="serif italic text-ink-2 mt-2">This shapes your profile and what the community sees first. Everything here can change later.</p></div>
              <Field label="Handle" error={errors.handle} hint={handleState === "checking" ? "Checking…" : handleState === "ok" ? `borncinema.com/profile/${f.handle} is yours.` : handleState === "taken" ? "That handle is taken." : handleState === "bad" ? "3–24 characters: letters, numbers, dashes." : "How people find you."}>
                <div className="flex items-baseline gap-2"><span className="label-sm text-ink-3">@</span><input value={f.handle} onChange={(e) => { setTouchedHandle(true); set("handle", e.target.value.toLowerCase()); }} className="input" placeholder="yourname" /><span className={cn("h-2 w-2 rounded-full shrink-0", handleState === "ok" ? "bg-accent" : handleState === "taken" || handleState === "bad" ? "bg-ink-3" : "bg-line")} /></div>
              </Field>
              <div>
                <div className="label-sm text-ink-3 mb-3">I am a…</div>
                <div className="flex flex-wrap gap-2">{MAKES.map((m) => <button type="button" key={m} onClick={() => toggle("makes", m)} className={cn("chip", f.makes.includes(m) && "active")}>{m}</button>)}</div>
              </div>
              <div>
                <div className="label-sm text-ink-3 mb-3">Genres I gravitate toward</div>
                <div className="flex flex-wrap gap-2">{CREATOR_GENRES.map((g) => <button type="button" key={g} onClick={() => toggle("genres", g)} className={cn("chip", f.genres.includes(g) && "active")}>{g}</button>)}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="Where are you?" hint="Optional."><input value={f.location} onChange={(e) => set("location", e.target.value)} className="input text-base" placeholder="City" /></Field>
                <Field label="A line about you" hint={`${280 - f.bio.length} left`}><input value={f.bio} maxLength={280} onChange={(e) => set("bio", e.target.value)} className="input text-base" placeholder="I write about the hours nobody is awake for." /></Field>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={f.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-1" />
                <span className="text-sm text-ink-2">I'll keep it civil, credit what I borrow, and accept that public stories are read by the editorial desk before they go live.</span>
              </label>
              {(errors.agree || errors.form) && <p className="serif italic text-accent text-sm">{errors.agree || errors.form}</p>}
              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setStep(1)} className="label-sm text-ink-3 hover:text-ink">← Back</button>
                <button className="btn btn-primary" disabled={busy || handleState === "checking"}>{busy ? "Opening your studio…" : "Become a creator"}</button>
              </div>
            </form>
          )}
        </div>
        <p className="label-sm text-ink-3 mt-10">Prototype accounts: passwords are hashed with scrypt and sessions are signed cookies. No email is sent.</p>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-sm text-ink-3">{label}</span>
      <div className="mt-1">{children}</div>
      {error ? <span className="block serif italic text-accent text-sm mt-2">{error}</span> : hint ? <span className="block label-sm text-ink-3 mt-2">{hint}</span> : null}
    </label>
  );
}
