import type { AITextProvider, Suggestion } from "../types";
import { mockText } from "./mock-text";

/**
 * OpenAI-backed provider. Every call goes through /api/ai (server-side key).
 * If the server reports it is not configured, or a call fails, the local partner answers instead,
 * so the product never breaks and the UI can say which one is talking.
 */
type Status = { configured: boolean; model: string };
let status: Status | null = null;
let statusPromise: Promise<Status> | null = null;
export async function getAIStatus(): Promise<Status> {
  if (status) return status;
  if (!statusPromise) statusPromise = fetch("/api/ai/status").then((r) => r.json()).then((s): Status => (status = { configured: !!s.configured, model: String(s.model) })).catch((): Status => (status = { configured: false, model: "local creative partner" }));
  return statusPromise;
}

let sid = 1000;
const toSugg = (items: unknown): Suggestion[] => (Array.isArray(items) ? items : []).filter((x) => x && typeof (x as any).text === "string").map((x: any) => ({ id: `oa${++sid}`, text: String(x.text), detail: x.detail ? String(x.detail) : undefined }));

async function call<T>(op: string, args: Record<string, unknown>, fallback: () => Promise<T>, pick: (r: any) => T | null): Promise<T> {
  const s = await getAIStatus();
  if (!s?.configured) return fallback();
  try {
    const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ op, args }) });
    if (!r.ok) throw new Error(`ai ${r.status}`);
    const data = await r.json();
    const out = pick(data.result);
    if (out === null || out === undefined) throw new Error("bad shape");
    return out;
  } catch (e) {
    console.warn(`[ai] ${op} fell back to local partner:`, e);
    return fallback();
  }
}

export const openaiText: AITextProvider = {
  get name() { return status?.configured ? `OpenAI · ${status.model}` : "Local creative partner"; },
  get isMock() { return !status?.configured; },

  interpretIdea: (idea) => call("interpretIdea", { idea }, () => mockText.interpretIdea(idea), (r) => (r?.summary && r?.firstQuestion ? { genre: String(r.genre || "drama"), mood: String(r.mood || ""), summary: String(r.summary), firstQuestion: String(r.firstQuestion) } : null)),
  generateCharacterNames: (ctx, styleHint) => call("generateCharacterNames", { ctx, styleHint }, () => mockText.generateCharacterNames(ctx, styleHint), (r) => { const s = toSugg(r?.items); return s.length ? s : null; }),
  generateLocations: (ctx, describe) => call("generateLocations", { ctx, describe }, () => mockText.generateLocations(ctx, describe), (r) => { const s = toSugg(r?.items); return s.length ? s : null; }),
  refineLocation: (ctx, base) => call("refineLocation", { ctx, base }, () => mockText.refineLocation(ctx, base), (r) => { const s = toSugg(r?.items); return s.length ? s : null; }),
  generateCharacterField: (ctx, field, hint) => call("generateCharacterField", { ctx, field, hint }, () => mockText.generateCharacterField(ctx, field, hint), (r) => { const s = toSugg(r?.items); return s.length ? s : null; }),
  generateDirections: (ctx) => call("generateDirections", { ctx }, () => mockText.generateDirections(ctx), (r) => { const s = toSugg(r?.items); return s.length ? s : null; }),
  generateStructure: (ctx) => call("generateStructure", { ctx }, () => mockText.generateStructure(ctx), (r) => (r?.logline && Array.isArray(r?.acts) ? { logline: String(r.logline), premise: String(r.premise || ""), themes: Array.isArray(r.themes) ? r.themes.map(String) : [], conflict: String(r.conflict || ""), acts: r.acts.map((a: any) => ({ title: String(a.title || "Act"), beats: Array.isArray(a.beats) ? a.beats.map(String) : [] })), ending: String(r.ending || "") } : null)),
  composeStory: (ctx, st) => call("composeStory", { ctx, structure: st }, () => mockText.composeStory(ctx, st), (r) => (Array.isArray(r?.paragraphs) && r.paragraphs.length ? { title: String(r.title || "Untitled"), paragraphs: r.paragraphs.map(String), synopsis: String(r.synopsis || ""), hook: String(r.hook || "") } : null)),
  generateTitles: (ctx) => call("generateTitles", { ctx }, () => mockText.generateTitles(ctx), (r) => { const s = toSugg(r?.items); return s.length ? s : null; }),
  rewrite: (text, mode, ctx) => call("rewrite", { ctx, text, mode }, () => mockText.rewrite(text, mode, ctx), (r) => (typeof r?.text === "string" && r.text.trim() ? r.text : null)),
  generateVisualDirection: (ctx, styleKey, describe) => call("generateVisualDirection", { ctx, styleKey, describe }, () => mockText.generateVisualDirection(ctx, styleKey, describe), (r) => (r?.style && Array.isArray(r?.palette) ? { style: String(r.style), palette: r.palette.slice(0, 5).map(String), lenses: String(r.lenses || ""), light: String(r.light || ""), movement: String(r.movement || ""), references: Array.isArray(r.references) ? r.references.map(String) : [], summary: String(r.summary || "") } : null)),
  generateShots: (ctx, sceneText) => call("generateShots", { ctx, sceneText }, () => mockText.generateShots(ctx, sceneText), (r) => (Array.isArray(r?.shots) && r.shots.length ? r.shots.map((s: any, i: number) => ({ n: Number(s.n || i + 1), type: String(s.type || "Shot"), description: String(s.description || ""), camera: String(s.camera || ""), lighting: String(s.lighting || ""), mood: String(s.mood || ""), duration: String(s.duration || "5s") })) : null)),
  partner: (ctx, question) => call("partner", { ctx, question }, () => mockText.partner(ctx, question), (r) => (typeof r?.text === "string" ? { text: r.text, options: toSugg(r.options) } : null)),
  clarify: (ctx, vague) => call("clarify", { ctx, vague }, () => mockText.clarify(ctx, vague), (r) => (typeof r?.text === "string" && Array.isArray(r?.options) ? { text: r.text, options: toSugg(r.options) } : null)),
};
