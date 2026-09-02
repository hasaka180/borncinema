import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY);
  return NextResponse.json({ configured, provider: configured ? "openai" : "local", model: configured ? process.env.OPENAI_MODEL || "gpt-4o-mini" : "local creative partner", images: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_IMAGES === "1") });
}
