import type { AITextProvider } from "../types";
import { mockText } from "./mock-text";

/**
 * Real provider scaffold. Wire ANTHROPIC_API_KEY through a server route (never the browser),
 * then implement each method by prompting the model with the ProjectContext and parsing JSON.
 * Until then every call falls through to the local partner and is labelled as such in the UI.
 */
export function createAnthropicText(apiKey?: string): AITextProvider {
  if (!apiKey) return mockText;
  return {
    ...mockText,
    name: "Claude (via /api/ai)",
    isMock: false,
    // Example of the shape the real implementation takes:
    // async interpretIdea(idea) {
    //   const r = await fetch("/api/ai/interpret", { method: "POST", body: JSON.stringify({ idea }) });
    //   return r.json();
    // },
  };
}
