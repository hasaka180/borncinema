import type { AITextProvider, ComposedStory, Interpretation, ProjectContext, Shot, Suggestion, VisualDirection } from "../types";
import { sleep } from "@/lib/utils";

/** Deterministic-ish local "creative partner". Structured so a real model can replace it call-for-call. */
let idc = 0;
const S = (text: string, detail?: string): Suggestion => ({ id: `sg${++idc}`, text, detail });
const has = (s: string, ...ws: string[]) => ws.some((w) => s.toLowerCase().includes(w));
const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5);
const think = (min = 700, max = 1300) => sleep(min + Math.random() * (max - min));

function detectGenre(idea: string): { genre: string; mood: string } {
  const i = idea.toLowerCase();
  if (has(i, "future", "time", "phone call from", "2049", "robot", "ai", "space", "years in the")) return { genre: "psychological sci-fi", mood: "uneasy, intimate" };
  if (has(i, "house", "haunt", "dark", "ghost", "dead", "blood")) return { genre: "slow-burn horror", mood: "dread, quiet" };
  if (has(i, "murder", "detective", "kill", "police", "lie")) return { genre: "high-concept mystery", mood: "tense, sunlit" };
  if (has(i, "love", "wedding", "marriage", "kiss", "sister", "mother", "father")) return { genre: "intimate drama", mood: "tender, unresolved" };
  if (has(i, "city", "map", "street", "hidden", "magic", "dragon")) return { genre: "urban fantasy", mood: "restless, playful" };
  if (has(i, "funny", "comedy", "restaurant", "waiter")) return { genre: "melancholy comedy", mood: "wry, warm" };
  return { genre: "literary drama", mood: "quiet, charged" };
}

const NAME_BANKS: Record<string, string[]> = {
  default: ["Mara Voss", "Elena Vale", "Nora Quinn", "Amara Reed", "Ilse Marek", "Tessa Okonkwo", "Juno Halloran", "Vera Lindqvist"],
  middle: ["Layla Haddad", "Noor Sabbagh", "Yasmin Farouk", "Dalia Khoury", "Rania Mansour", "Samira Qasim", "Lina Nasser", "Zayna Aziz"],
  nordic: ["Solveig Aune", "Ingrid Strand", "Maren Dahl", "Astrid Hovland", "Liv Bergström", "Sigrid Halvorsen"],
  japanese: ["Aoi Tanabe", "Rin Sakamoto", "Hana Kobayashi", "Mio Fujiwara", "Yui Nakashima", "Sora Hayashi"],
  african: ["Adaeze Okafor", "Chiamaka Eze", "Ngozi Bello", "Amara Nwosu", "Zuri Mensah", "Ife Adeyemi"],
  latin: ["Ximena Reyes", "Lucía Salcedo", "Valentina Moreau", "Camila Ortiz", "Inés Varela", "Paloma Ferrer"],
  male: ["Jonas Vik", "Kasper Lund", "Tariq Amin", "Elliot Pell", "Devon Okafor", "Silas Marr", "Rafael Ochoa", "Idris Kane"],
  old: ["Remedios Salazar", "Frau Ostrowski", "Ada Whitcombe", "Ezra Bellweather", "Hester Crane", "Augusta Vane"],
};

function bankFor(hint?: string, ctx?: ProjectContext) {
  const h = (hint || "").toLowerCase() + " " + (ctx?.location?.name || "").toLowerCase();
  if (has(h, "middle east", "arab", "dubai", "cairo", "persian", "egypt")) return NAME_BANKS.middle;
  if (has(h, "nordic", "scandi", "norw", "swed", "iceland", "arctic", "reykjav", "troms")) return NAME_BANKS.nordic;
  if (has(h, "japan", "kyoto", "tokyo")) return NAME_BANKS.japanese;
  if (has(h, "african", "nigeria", "lagos", "ghana", "kenya")) return NAME_BANKS.african;
  if (has(h, "latin", "spanish", "mexic", "argentin", "chile")) return NAME_BANKS.latin;
  if (has(h, "man", "male", "he ", "boy", "father", "brother")) return NAME_BANKS.male;
  if (has(h, "old", "elder", "grandmother", "grandfather", "80")) return NAME_BANKS.old;
  return NAME_BANKS.default;
}

export const mockText: AITextProvider = {
  name: "Local creative partner (mock)",
  isMock: true,

  async interpretIdea(idea) {
    await think(900, 1500);
    const { genre, mood } = detectGenre(idea);
    const i = idea.toLowerCase();
    const she = has(i, "woman", "she", "her", "girl", "mother", "sister", "daughter");
    const who = she ? "she" : has(i, "man", "he ", "his", "boy", "father", "brother") ? "he" : "they";
    return {
      genre, mood,
      summary: `I see a ${genre} developing here. The engine is ${has(i, "call", "letter", "message") ? "a message that arrives from the wrong time" : has(i, "city", "town") ? "a place with its own rules" : "a person who wants something they cannot name"}; the mood wants to be ${mood}.`,
      firstQuestion: `Before we build it, let's understand your protagonist. Who ${who === "they" ? "are they" : `is ${who}`}?`,
    } satisfies Interpretation;
  },

  async generateCharacterNames(ctx, styleHint) {
    await think();
    const bank = bankFor(styleHint, ctx);
    return shuffle(bank).slice(0, 4).map((n) => S(n, styleHint ? `Fits: ${styleHint}` : undefined));
  },

  async generateLocations(ctx, describe) {
    await think();
    const d = (describe || "").toLowerCase();
    if (has(d, "lonely", "empty", "abandon")) return [
      S("A beautiful city slowly being abandoned", "Wide boulevards, no traffic. Lights on timers nobody reset."),
      S("A hyper-modern city where humans barely interact", "Glass, distance, everything delivered. Nobody touches."),
      S("A city controlled entirely by an invisible system", "It runs perfectly. That is the problem."),
      S("A resort town in its off-season", "Everything built for crowds, occupied by six people."),
    ];
    if (has(d, "cold", "north", "snow", "ice")) return [S("Tromsø, above the Arctic Circle"), S("A remote research station on the ice"), S("A fishing village in fifty-eight days of dark"), S("A fictional northern port that has stopped receiving ships")];
    if (has(d, "hot", "desert", "sun")) return [S("Old Dubai, along the creek"), S("A dammed valley in northern Mexico"), S("A sun-bleached town where the fountain is dry"), S("A fictional coastal city built for a boom that never came")];
    if (has(d, "water", "sea", "ocean", "coast")) return [S("A lighthouse on a coast that has run out of ships"), S("Lagos, on the lagoon"), S("A ferry crossing that takes exactly one conversation"), S("A fictional island that appears on no chart")];
    const base = [S("Dubai", "Two cities, one skyline."), S("Reykjavik", "Small enough that everyone is a witness."), S("Mumbai", "A city that never has a private moment."), S("A fictional coastal city", "You decide the rules."), S("A remote Arctic research station", "One door. One winter."), S("Kyoto at blue hour", "Ritual and dusk."), S("A sealed subway station", "Underneath everything.")];
    return shuffle(base).slice(0, 5);
  },

  async refineLocation(ctx, base) {
    await think(500, 900);
    const b = base.toLowerCase();
    if (has(b, "dubai")) return [S("Old Dubai · Deira and the creek", "Abras, spice, a house condemned four times."), S("Downtown", "Towers that lean out over you."), S("Jumeirah", "Villas, quiet, money that whispers."), S("The industrial district", "Al Quoz. Warehouses, dust, art."), S("A fictional future Dubai", "The weather is scheduled by law.")];
    if (has(b, "reykjav", "iceland")) return [S("The old harbour", "Ships that no longer leave."), S("A geothermal plant outside the city"), S("A summer house in the lava fields"), S("A fictional Reykjavik in constant daylight")];
    if (has(b, "mumbai")) return [S("A chawl in Girgaon"), S("The Sea Link at 3 a.m."), S("A film studio in Goregaon"), S("A fictional Mumbai where the monsoon never arrives")];
    if (has(b, "subway", "station", "underground")) return [S("The driver's cab", "Everything seen through glass."), S("The sealed platform", "1987. Tiles like old teeth."), S("The transit archive", "Blueprints that disagree."), S("The stairs that lead to nothing")];
    return [S(`${base} — the old quarter`), S(`${base} — the newest district`), S(`${base} — the edge, where it stops`), S(`A fictional version of ${base}`, "Keep the feeling, change the facts.")];
  },

  async generateCharacterField(ctx, field, hint) {
    await think();
    const name = ctx.protagonist?.name || "your character";
    const loc = ctx.location?.name;
    const banks: Record<string, Suggestion[]> = {
      desire: [S("To find her missing brother."), S("To escape her past."), S("To prove that her father was innocent."), S("To understand why she remembers events that haven't happened."), S(`To leave ${loc || "this place"} before it notices.`), S("To be believed, once, by anyone.")],
      fear: [S("That she is the one who is lying."), S("That the message was meant for someone else."), S("That nothing is wrong, and this is just her life now."), S("Being forgotten while still in the room."), S("That she will get exactly what she wants.")],
      secret: [S("She has already made the call herself."), S("She was there the night it happened."), S("She has been to the place before, as a child, and remembers the smell."), S("She does not want to be found."), S("She has been reading the letters first.")],
      occupation: [S("Night-shift train driver"), S("Junior forecaster at the Ministry"), S("Wedding photographer"), S("Lighthouse keeper"), S("Court translator"), S("Projectionist at a closing cinema"), S("Reporter who stopped filing")],
      personality: [S("Precise, private, funnier than she lets on."), S("Warm in public, exhausted in private."), S("Patient in the way of someone waiting to be proven right."), S("Reckless with other people, careful with herself."), S("Listens more than is comfortable.")],
      arc: [S(`${name} begins by keeping the rule and ends by breaking it.`), S(`${name} learns the truth and chooses not to use it.`), S(`${name} stops waiting.`), S(`${name} is the one who was lying, and forgives herself.`), S(`${name} opens the door.`)],
      appearance: [S("A coat with a burn mark on the left cuff."), S("Hair pulled back like she's about to be told bad news."), S("Reading glasses she refuses to wear in public."), S("Tall, stoops slightly, as if under a low ceiling."), S("Eyes that check the exits.")],
      background: [S("Grew up above the shop her mother lost."), S("Trained for something else entirely."), S("Left once and came back without telling anyone why."), S("Youngest of four; the only one who stayed."), S("Has a sister she has not spoken to in fourteen months.")],
    };
    let out = shuffle(banks[field]).slice(0, 4);
    if (hint) out = out.map((s) => ({ ...s, detail: `Leaning toward: ${hint}` }));
    return out;
  },

  async generateDirections(ctx) {
    await think(1100, 1700);
    const n = ctx.protagonist?.name || "The protagonist";
    const loc = ctx.location?.name || "the city";
    const want = ctx.protagonist?.desire?.replace(/\.$/, "").replace(/^To /, "to ") || "to understand what is happening";
    return [
      S("The slow-burn", `${n} keeps the rule for as long as possible. Every night ${loc} offers a little more. The story is about the night she stops.`),
      S("The confession", `${n} already knows the answer. The story is the reader catching up. We learn what ${n} wants (${want}) only when it is too late to want it.`),
      S("The mirror", `Whatever ${n} is chasing turns out to be a version of herself: older, or younger, or the one who stayed. ${loc} is the corridor between them.`),
      S("The community", `${n} is not alone. Others in ${loc} have seen it too. The story widens; the ending narrows back to one face.`),
    ];
  },

  async generateStructure(ctx) {
    await think(1400, 2100);
    const n = ctx.protagonist?.name || "The protagonist";
    const deArticle = (t: string) => t.replace(/^(A|An|The)\s/, (m) => m.toLowerCase());
    const loc = deArticle(ctx.location?.name || "the city");
    const rawDetail = (ctx.location?.detail || "").replace(new RegExp(`^${(ctx.location?.name || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[—·-]\\s*`, "i"), "");
    const detail = rawDetail ? `, ${deArticle(rawDetail)}` : "";
    const want = ctx.protagonist?.desire?.replace(/\.$/, "") || "to know";
    const fear = ctx.protagonist?.fear?.replace(/\.$/, "") || "being wrong";
    const secret = ctx.protagonist?.secret?.replace(/\.$/, "") || "she has been here before";
    const dir = ctx.direction || "the slow-burn";
    const idea = ctx.idea.trim().replace(/\.$/, "");
    return {
      logline: `In ${loc}${detail}, ${n} wants ${want.toLowerCase()} — but ${idea.charAt(0).toLowerCase() + idea.slice(1)}, and the only way through is the thing she fears most: ${fear.toLowerCase()}.`,
      premise: `${idea}. ${n} has a rule about it, and the story is the night the rule stops working. Taking ${dir.toLowerCase()} route: we stay close, we withhold, and we let ${loc} do the talking.`,
      themes: ["What we owe our past selves", "Rules as a form of grief", "Places that remember us"],
      conflict: `${n} versus the version of the truth she can live with. Externally: ${loc} keeps offering the thing she asked for. Internally: ${secret}.`,
      acts: [
        { title: "Act I — The Rule", beats: [`${loc}${detail}. ${n} in the middle of a routine so precise it is obviously a wound.`, `The premise arrives (${idea.toLowerCase()}). ${n} treats it as weather.`, `A small transgression. ${n} looks a second longer than she should.`] },
        { title: "Act II — The Drift", beats: [`The routine bends. ${n} starts arriving early. Someone notices.`, `The thing she wants (${want.toLowerCase()}) gets close enough to have a face.`, `The secret surfaces: ${secret.toLowerCase()}. ${n} tells no one, which is the same as telling us.`, `Midpoint: ${n} stops.`] },
        { title: "Act III — The Door", beats: [`Face to face with it. ${loc} goes quiet.`, `The fear (${fear.toLowerCase()}) is not what she thought. It is worse and smaller.`, `${n} makes the choice the whole story has been avoiding. We do not see the result. We see her face.`] },
      ],
      ending: `Open, but decided. ${n} has chosen; the reader has not been told which way. The last image belongs to ${loc}.`,
    };
  },

  async composeStory(ctx, st) {
    await think(2200, 3200);
    const n = ctx.protagonist?.name || "She";
    const first = n.split(" ")[0];
    const loc = ctx.location?.name || "the city";
    const detail = ctx.location?.detail;
    const occ = ctx.protagonist?.occupation?.toLowerCase();
    const idea = ctx.idea.trim().replace(/\.$/, "");
    const want = ctx.protagonist?.desire?.replace(/\.$/, "").replace(/^To /, "to ") || "to understand";
    const fear = ctx.protagonist?.fear?.replace(/\.$/, "") || "that nothing was wrong";
    const secret = ctx.protagonist?.secret?.replace(/\.$/, "") || "she had been here before";
    const dark = (ctx.tone || "").includes("dark");
    const paragraphs = [
      `${idea}. ${first} had known this for eleven months and had told no one, which in ${loc} was less a decision than a habit; ${loc} was a place where people kept things the way other cities kept parks, as a public amenity nobody used.`,
      `${occ ? `She was a ${occ}, which meant her hours were wrong and her silences were long. ` : ""}Every day had the same shape. ${detail ? `${detail}, ` : ""}the same route, the same nine seconds where the thing she was not looking at slid past the edge of her attention like a photograph someone had forgotten to develop.`,
      `What she wanted was simple and she was ashamed of it. She wanted ${want}. She had wanted it so long that the wanting had become a kind of furniture, something she walked around in the dark without touching.`,
      `In the second month it got closer. In the third it had a face. By the fourth she had started arriving early, and a colleague had written it up, and she had said the weather was bad, and he had said it was spring, and she had said it was a bad spring.`,
      `${first} had a rule. The rule was that she would look, and not stop. The rule had kept her alive, or at least employed, and she had begun to suspect those were the same thing.`,
      `The secret was that ${secret}. She did not think of it as a secret. She thought of it as the only part of the story that was hers.`,
      dark ? `Tonight she broke the rule. It was not brave. It was the opposite of brave; it was a woman so tired of being careful that carelessness felt like rest.` : `Tonight she broke the rule. She would say afterwards that she did not decide to. That was not true, and she knew it was not true, and she said it anyway, because it was easier than saying that she had decided months ago, at a kitchen table, with the lights off.`,
      `${loc} went quiet in the way that places do when they have been waiting for you. She stood very still. She had imagined this so many times that the real thing felt like a rehearsal: the light wrong, the distances shorter, everything a little cheaper than the version in her head.`,
      `And then it was in front of her, and she understood, with the flat clarity of someone reading their own handwriting, that the thing she had feared, ${fear.toLowerCase()}, was not what was waiting. What was waiting was smaller. What was waiting was familiar. It was wearing her coat.`,
      `She did not remember putting her hand on the door. She noticed it there the way you notice you have been holding your breath, with irritation and then with something like tenderness. Behind her, in the part of ${loc} she had come from, something had begun to move.`,
      `${st.ending.startsWith("Open") ? `She has not yet decided. She has decided, though, what she will say when she does. She has been saying it, to herself, every day, for eleven months.` : `She opened the door.`}`,
    ];
    const title = ctx.choices?.find((c) => c.startsWith("title:"))?.slice(6) || `The ${["Last", "Quiet", "Ninth", "Second"][Math.floor(Math.random() * 4)]} ${["Door", "Hour", "Platform", "Call", "Winter"][Math.floor(Math.random() * 5)]}`;
    return {
      title,
      paragraphs,
      synopsis: st.logline,
      hook: `${idea}. Tonight, ${first} stops.`,
    } satisfies ComposedStory;
  },

  async generateTitles(ctx) {
    await think();
    const loc = (ctx.location?.name || "").split(",")[0];
    const opts = ["The Last Door", "Nine Seconds", "A Wet March", "The Hour Before", `${loc ? `${loc} at 2:13` : "2:13"}`, "The Coat", "What the Platform Knew", "Arrival", "The Rule"];
    return shuffle(opts).slice(0, 5).map((t) => S(t));
  },

  async rewrite(text, mode) {
    await think(800, 1400);
    switch (mode) {
      case "shorten": { const s = text.split(". "); return s.slice(0, Math.max(1, Math.ceil(s.length * 0.6))).join(". ").replace(/\.?$/, "."); }
      case "expand": return text + " The details accumulated the way they do when you are trying not to look at the thing in the middle of the room: the tiles, the hum, the exact weight of the coat.";
      case "darker": return text.replace(/tenderness/g, "dread").replace(/rest/g, "surrender") + " Nothing here was going to be forgiven.";
      case "funnier": return text + " Somewhere, inevitably, a vending machine hummed the only note it knew, and it was flat.";
      case "emotional": return text + " She thought of her sister. She thought of the kitchen. She thought, absurdly, of the button that had never matched.";
      case "surprise": return "It was not her coat. It was her mother's. " + text;
      default: return text;
    }
  },

  async generateVisualDirection(ctx, styleKey, describe) {
    await think(1000, 1600);
    const map: Record<string, VisualDirection> = {
      realistic: { style: "Realistic", palette: ["#0c1117", "#3b4652", "#c9b79c", "#79b8cf", "#e7edf3"], lenses: "35mm and 50mm, eye level, minimal movement", light: "Available light, practicals, no fill", movement: "Handheld when she moves, locked when she stops", references: ["Kitchen-sink realism", "Documentary framing"], summary: "The camera behaves like a witness. Nothing is beautiful on purpose." },
      indie: { style: "Indie film", palette: ["#17100d", "#5a4636", "#cf9b45", "#b5702a", "#f4e8d4"], lenses: "Vintage primes, soft, slight halation", light: "Window light, sodium at night, one lamp", movement: "Slow push-ins. Long takes. A zoom once, when it matters.", references: ["16mm warmth", "Static wides, close faces"], summary: "Intimate, patient, and a little grainy. The film looks like it was made by people who love her." },
      noir: { style: "Neo-noir", palette: ["#0a0a0c", "#2b2f36", "#d6a24d", "#3d9a99", "#f1ede6"], lenses: "Anamorphic, wide, low", light: "Sodium and teal. One source. Wet surfaces.", movement: "Dollies through corridors. The camera never blinks.", references: ["Sodium vapour cities", "Reflections in glass"], summary: "The city is a throat. We never see the sky. The elevator glows like a hospital at 4 a.m." },
      animation: { style: "Animation", palette: ["#0b0b0b", "#3b3b3b", "#8a2c2c", "#f6f4ef", "#d6a24d"], lenses: "Virtual 40mm, painterly depth", light: "Ink and soot; light as absence of line", movement: "Hand-drawn, frame rate drops when she is afraid", references: ["Charcoal that smudges", "Rotoscoped faces"], summary: "Line work for the present, charcoal for what's underneath. When she moves too fast, the world smears." },
      experimental: { style: "Experimental", palette: ["#0c1117", "#79b8cf", "#e7edf3", "#8a2c2c", "#0a0a0c"], lenses: "Whatever is wrong. Pinhole. Phone. Surveillance.", light: "Fluorescent, flicker, strobe of a passing train", movement: "Discontinuous. Time cuts mid-gesture.", references: ["Found footage", "Structuralist film"], summary: "The story is told by the station's cameras. She is the only thing they cannot see clearly." },
      period: { style: "Period drama", palette: ["#1f1613", "#cf9b45", "#8f3a3a", "#f4e8d4", "#0a0a0c"], lenses: "Spherical, 1.66:1, soft edges", light: "Tungsten, candle, projector beam", movement: "Formal. Tableaux. One crane at the end.", references: ["Silver halide", "Faded print"], references2: [], summary: "Everything looks like a memory of a film rather than a film." } as any,
      scifi: { style: "Sci-fi", palette: ["#0c1117", "#16212d", "#79b8cf", "#3f6fa6", "#e7edf3"], lenses: "Long lenses, compressed, airless", light: "Screens. Sky like a monitor left on.", movement: "Glacial. Slow drift, no cuts inside the tower.", references: ["Two cities, one frame", "Glass and distance"], summary: "The future is clean and it is the cleanness that frightens." },
      documentary: { style: "Documentary", palette: ["#f3efe7", "#b5702a", "#2f6b6a", "#1a1815", "#faf8f3"], lenses: "Zoom, handheld, whatever is there", light: "The light that is there. Especially at 4 p.m.", movement: "Reactive. The camera is late to things, like a person.", references: ["Reported", "Faces that answer questions properly"], summary: "Real light, real people, real refusal. The camera asks and waits." },
      stylized: { style: "Stylized", palette: ["#0a0a0c", "#d6a24d", "#8a2c2c", "#3d9a99", "#f1ede6"], lenses: "Wide, symmetrical, centred", light: "Coloured, motivated by nothing", movement: "Whip pans, tracking, the camera as a character", references: ["Theatrical", "Every frame a poster"], summary: "Heightened. The world knows it is being watched." },
    };
    const base = map[styleKey] || map.indie;
    if (describe) return { ...base, style: `Custom: ${describe}`, summary: `${describe}. Translated: ${base.summary}` };
    return base;
  },

  async generateShots(ctx, _sceneText) {
    await think(1200, 1800);
    const n = ctx.protagonist?.name?.split(" ")[0] || "She";
    const loc = ctx.location?.name || "the location";
    return [
      { n: 1, type: "Wide establishing", description: `${loc}, empty. Something is wrong with the light.`, camera: "Anamorphic 40mm, locked off, low", lighting: "Single sodium source, deep shadow", mood: "Held breath", duration: "8s" },
      { n: 2, type: "Medium", description: `${n} in profile. Routine gestures, too precise.`, camera: "50mm, slow push-in", lighting: "Practical from the console, cool fill", mood: "Ritual", duration: "6s" },
      { n: 3, type: "Close-up", description: `${n}'s eyes. She looks, one second too long.`, camera: "85mm, static", lighting: "Catchlight only", mood: "Transgression", duration: "4s" },
      { n: 4, type: "Over-the-shoulder", description: `From behind ${n}, the thing she has been not-looking at. It is looking back.`, camera: "35mm, shallow, focus racks to background", lighting: "Its light on her shoulder", mood: "Recognition", duration: "7s" },
      { n: 5, type: "Insert", description: "Her hand on the door release. She does not remember putting it there.", camera: "Macro, handheld", lighting: "Amber from the panel", mood: "Decision", duration: "3s" },
      { n: 6, type: "Wide, reverse", description: `${loc} from the other side. ${n} is small. Behind her, something moves.`, camera: "Anamorphic 28mm, slow dolly back", lighting: "All sources fade but one", mood: "Open ending", duration: "10s" },
    ] satisfies Shot[];
  },

  async partner(ctx, q) {
    await think(900, 1500);
    const n = ctx.protagonist?.name || "your protagonist";
    const ql = q.toLowerCase();
    if (has(ql, "ending")) { const loc = ctx.location?.name || "the place"; return { text: `Three darker endings, in order of how much they cost ${n}:`, options: [S("She gets what she wanted, and it is empty.", "The mirror was the point. She has been the other one all along."), S(`She refuses, and ${loc} goes quiet and stays quiet.`, "The rule wins. She is still there."), S("She steps through, and we cut to someone else beginning the same night.", "Loop. Somebody else in her place.")] }; }
    if (has(ql, "morally", "complicated", "complex")) return { text: `Make ${n} complicit. Right now she is a witness; witnesses are safe. Give her something she did: she was on shift the night the station was sealed, or she sent the first message herself, or she has been arriving early on purpose because she wants the schedule to break. Pick one and the story stops being about what she sees.`, options: [S("She sent the first message herself"), S("She was there the night it was sealed"), S("She has been breaking the schedule on purpose")] };
    if (has(ql, "slow-burn", "slow burn", "thriller")) return { text: `For a slow-burn: delay the face. Right now it appears in month one. Push it to the midpoint and spend the first half on the routine and the tiny transgressions; a second too long, a brake a little early. The reader should feel the schedule drifting before ${n} admits it.`, options: [S("Delay the face to the midpoint"), S("Add a colleague who notices"), S("Make each night one paragraph, so the drift is visible")] };
    if (has(ql, "location", "visual")) return { text: `Somewhere with a threshold. The story is about a door, so the location should have a lot of them, or none. Options:`, options: [S("A sealed subway station", "Underneath everything. Nine seconds of platform per night."), S("A lighthouse on a coast without ships", "One door, one light, one direction."), S("A hotel where every room is the same room in a different year", "Doors as time.")] };
    if (has(ql, "logic", "problem", "plot hole", "missing")) return { text: `Two things I'd press on. First: why eleven months? If the thing appears every night, the reader needs to feel why tonight and not night forty. Give her a deadline, a last shift, a transfer. Second: who else knows? A world where only ${n} sees it is a ghost story; a world where others see it and say nothing is a much better one.`, options: [S("Give her a last shift"), S("Let a colleague have seen it too"), S("Cut the archive scene; keep the mystery in the tunnel")] };
    if (has(ql, "name")) return { text: `Five names that fit this world:`, options: shuffle(bankFor(undefined, ctx)).slice(0, 5).map((x) => S(x)) };
    if (has(ql, "scene", "cinematic")) return { text: `As a scene, this chapter wants to be one continuous take from inside the cab. The platform slides past. We never cut to the elevator; we only see it in the glass, with her reflection over it. The three words happen in a close-up we cannot hear.`, options: [S("Write it as a single take"), S("Storyboard the reflection shot"), S("Turn this into the film's opening")] };
    return { text: `Here's what I'd push on. The idea (“${ctx.idea.slice(0, 80)}${ctx.idea.length > 80 ? "…" : ""}”) is strong because it has a rule. Stories with rules are about the night the rule breaks. So: what does ${n} lose by breaking it? If the answer is “nothing”, the story has no second act. If the answer is her job, her sister, her sense of being sane, then we're in business.`, options: [S("Her job"), S("Her sister"), S("Her certainty that she is well")] };
  },

  async clarify(ctx, vague) {
    await think(900, 1400);
    const v = vague.toLowerCase();
    if (has(v, "city", "futur", "lonely")) return { text: "I can take that in several directions:", options: [S("A — A hyper-modern city where humans barely interact"), S("B — A beautiful city slowly being abandoned"), S("C — A city controlled entirely by an invisible system"), S("D — Something else")] };
    if (has(v, "sad", "melanch", "grief")) return { text: "Sad how? These are different films:", options: [S("A — Sad because something was lost"), S("B — Sad because nothing changed"), S("C — Sad because she got what she wanted"), S("D — Something else")] };
    if (has(v, "scary", "horror", "creepy")) return { text: "Scary in which register?", options: [S("A — Something is in the house"), S("B — Nothing is in the house and that is worse"), S("C — She is the thing in the house"), S("D — Something else")] };
    return { text: "Let me sharpen that. Which is closest?", options: [S("A — It's about a person who cannot go back"), S("B — It's about a place that remembers"), S("C — It's about a message from the wrong time"), S("D — Something else")] };
  },
};
