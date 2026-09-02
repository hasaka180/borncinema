import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, buildPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";

/**
 * Server-side bridge to the model. The API key never reaches the browser.
 * POST { op, args } -> JSON produced by the model for that op.
 */
export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "not_configured" }, { status: 503 });
  let body: { op?: string; args?: Record<string, unknown> };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }
  const op = String(body.op || "");
  const args = body.args || {};
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const temperature = ["composeStory", "generateDirections", "partner"].includes(op) ? 0.9 : 0.8;
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model, temperature, response_format: { type: "json_object" },
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: buildPrompt(op, args) }],
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      return NextResponse.json({ error: "upstream", status: r.status, detail: t.slice(0, 400) }, { status: 502 });
    }
    const data = await r.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    let parsed: unknown;
    try { parsed = JSON.parse(content); } catch { return NextResponse.json({ error: "unparseable", detail: content.slice(0, 400) }, { status: 502 }); }
    return NextResponse.json({ ok: true, model, result: parsed });
  } catch (e) {
    return NextResponse.json({ error: "network", detail: String(e).slice(0, 300) }, { status: 502 });
  }
}
