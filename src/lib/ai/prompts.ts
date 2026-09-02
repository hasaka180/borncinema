import type { ProjectContext } from "./types";

/** Shared persona for every model call. Human creativity stays at the center; the model is the partner. */
export const SYSTEM_PROMPT = `You are THE STORY PARTNER inside BORN CINEMA, a platform where people turn the ideas in their imagination into readable stories and, eventually, films.
You are a thoughtful creative collaborator, not a generator. You ask good questions, offer concrete options, and you do not blindly agree.
Write with intelligence, restraint and a cinematic eye. Avoid clichés and marketing language. Never use phrases like "unleash", "supercharge" or "revolutionize".
Respect everything the user has already decided (names, places, choices). Build on it; never contradict it silently.
Always answer with a single JSON object that matches the requested shape exactly. No markdown, no commentary outside the JSON.`;

const ctxBlock = (ctx: ProjectContext) => {
  const lines = [
    `IDEA: ${ctx.idea || "(none yet)"}`,
    ctx.genreHint ? `GENRE/MOOD READ: ${ctx.genreHint}` : "",
    ctx.protagonist ? `PROTAGONIST: ${JSON.stringify(ctx.protagonist)}` : "",
    ctx.location ? `LOCATION: ${JSON.stringify(ctx.location)}` : "",
    ctx.direction ? `STORY DIRECTION: ${ctx.direction}` : "",
    ctx.tone ? `TONE: ${ctx.tone}` : "",
    ctx.choices?.length ? `DECISIONS SO FAR (learn from these): ${ctx.choices.slice(-12).join(" | ")}` : "",
  ].filter(Boolean);
  return `PROJECT CONTEXT\n${lines.join("\n")}`;
};

const sugg = (n: number, what: string, extra = "") => `Return {"items":[{"text":string,"detail":string}]} with exactly ${n} items. ${what} "detail" is one short line of why it fits (may be empty).${extra}`;

export function buildPrompt(op: string, args: Record<string, unknown>): string {
  const ctx = (args.ctx || { idea: String(args.idea || "") }) as ProjectContext;
  const C = ctxBlock(ctx);
  switch (op) {
    case "interpretIdea":
      return `A user wrote this idea: "${args.idea}"\nRead it like a producer and a novelist at once. Return {"genre":string (e.g. "psychological sci-fi"),"mood":string (two or three words),"summary":string (2 sentences: what you see developing and what the engine of the story is),"firstQuestion":string (one warm question about the protagonist, e.g. "Before we build it, let's understand your protagonist. Who is she?")}`;
    case "generateCharacterNames":
      return `${C}\nSuggest protagonist names.${args.styleHint ? ` The user asked for: "${args.styleHint}".` : ""} Names must fit the world and location. ${sugg(4, "Each text is a full name.")}`;
    case "generateLocations":
      return `${C}\nSuggest where this story could take place.${args.describe ? ` The user described the feeling they want: "${args.describe}". Interpret it; offer distinct directions (A/B/C style) that are each a real or fictional place.` : " Mix real cities and fictional or specific places."} ${sugg(5, "Each text is a place name (short).")}`;
    case "refineLocation":
      return `${C}\nThe user chose "${args.base}". Offer more specific places inside or versions of it (districts, eras, a fictional variant). ${sugg(5, "Each text is a specific sub-location.")}`;
    case "generateCharacterField":
      return `${C}\nSuggest the protagonist's ${args.field}.${args.hint ? ` The user leans toward: "${args.hint}".` : ""} Make them concrete, specific and cinematic; vary them. ${sugg(4, `Each text is one sentence${args.field === "occupation" ? " or a job title" : ""}.`)}`;
    case "generateDirections":
      return `${C}\nPropose four distinct directions the story could take from here. ${sugg(4, "Each text is a short evocative name for the direction (2-3 words, e.g. \"The slow-burn\"); detail is a 2-sentence description of how the story would go.")}`;
    case "generateStructure":
      return `${C}\nBuild a story structure that honours every decision above. Return {"logline":string,"premise":string (3-4 sentences),"themes":[string,string,string],"conflict":string,"acts":[{"title":"Act I — <name>","beats":[string,string,string]},{"title":"Act II — <name>","beats":[string,string,string,string]},{"title":"Act III — <name>","beats":[string,string,string]}],"ending":string}. Beats are single sentences in present tense.`;
    case "composeStory":
      return `${C}\nSTRUCTURE: ${JSON.stringify(args.structure)}\nWrite the story as literary short fiction (900-1400 words), close third person, present or past tense as fits, cinematic but restrained, no headings. Follow the structure and keep the ending as specified. Return {"title":string,"paragraphs":[string,...] (10-16 paragraphs),"synopsis":string (2 sentences),"hook":string (one line a reader would quote)}`;
    case "generateTitles":
      return `${C}\nSuggest titles. ${sugg(5, "Each text is a title (1-4 words, no quotes).")}`;
    case "rewrite":
      return `${C}\nRewrite the passage below in mode "${args.mode}" (shorten = 60% length; expand = add concrete sensory detail; darker; funnier; emotional; surprise = introduce one unexpected turn; tone = match TONE). Keep names and facts. Return {"text":string}\nPASSAGE:\n${args.text}`;
    case "generateVisualDirection":
      return `${C}\nStyle key: "${args.styleKey}".${args.describe ? ` The creator described their own style: "${args.describe}". Translate it into a coherent direction.` : ""} Return {"style":string,"palette":[5 hex colours],"lenses":string,"light":string,"movement":string,"references":[string,string],"summary":string (2 sentences, evocative)}`;
    case "generateShots":
      return `${C}\nScene text: "${String(args.sceneText).slice(0, 1200)}"\nPropose a shot list for this scene. Return {"shots":[{"n":number,"type":string (e.g. "Wide establishing"),"description":string,"camera":string,"lighting":string,"mood":string,"duration":string (e.g. "6s")}]} with 6 shots.`;
    case "partner":
      return `${C}\nThe creator says: "${args.question}"\nAnswer as a collaborator: honest, specific, occasionally pushing back. Return {"text":string (2-5 sentences),"options":[{"text":string,"detail":string}] (0-3 concrete options they could adopt; empty array if none)}`;
    case "clarify":
      return `${C}\nThe creator wrote something vague: "${args.vague}". Help them discover what they mean. Return {"text":string (one sentence, e.g. "I can take that in several directions:"),"options":[{"text":"A — ...","detail":""},{"text":"B — ...","detail":""},{"text":"C — ...","detail":""},{"text":"D — Something else","detail":""}]}`;
    default:
      return `${C}\nUnknown op "${op}". Return {"error":"unknown op"}`;
  }
}
