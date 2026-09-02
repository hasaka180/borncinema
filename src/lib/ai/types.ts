/**
 * AI provider contracts. UI never talks to a vendor directly.
 * Swap the provider in lib/ai/index.ts; everything else stays the same.
 */
export interface Suggestion { id: string; text: string; detail?: string }

export interface ProjectContext {
  idea: string;
  genreHint?: string;
  protagonist?: { name?: string; desire?: string; fear?: string; secret?: string; occupation?: string; age?: string };
  location?: { name?: string; detail?: string };
  direction?: string;
  tone?: string;
  choices?: string[]; // running log of accepted suggestions so the provider "learns" inside the project
}

export interface Interpretation {
  genre: string;
  mood: string;
  summary: string;
  firstQuestion: string;
}

export interface StoryStructure {
  logline: string;
  premise: string;
  themes: string[];
  conflict: string;
  acts: { title: string; beats: string[] }[];
  ending: string;
}

export interface ComposedStory { title: string; paragraphs: string[]; synopsis: string; hook: string }

export interface Shot { n: number; type: string; description: string; camera: string; lighting: string; mood: string; duration: string }
export interface VisualDirection { style: string; palette: string[]; lenses: string; light: string; movement: string; references: string[]; summary: string }

export interface AITextProvider {
  readonly name: string;
  readonly isMock: boolean;
  interpretIdea(idea: string): Promise<Interpretation>;
  generateCharacterNames(ctx: ProjectContext, styleHint?: string): Promise<Suggestion[]>;
  generateLocations(ctx: ProjectContext, describe?: string): Promise<Suggestion[]>;
  refineLocation(ctx: ProjectContext, base: string): Promise<Suggestion[]>;
  generateCharacterField(ctx: ProjectContext, field: "desire" | "fear" | "secret" | "occupation" | "personality" | "arc" | "appearance" | "background", hint?: string): Promise<Suggestion[]>;
  generateDirections(ctx: ProjectContext): Promise<Suggestion[]>;
  generateStructure(ctx: ProjectContext): Promise<StoryStructure>;
  composeStory(ctx: ProjectContext, structure: StoryStructure): Promise<ComposedStory>;
  generateTitles(ctx: ProjectContext): Promise<Suggestion[]>;
  rewrite(text: string, mode: "shorten" | "expand" | "darker" | "funnier" | "emotional" | "surprise" | "tone", ctx: ProjectContext): Promise<string>;
  generateVisualDirection(ctx: ProjectContext, styleKey: string, describe?: string): Promise<VisualDirection>;
  generateShots(ctx: ProjectContext, sceneText: string): Promise<Shot[]>;
  partner(ctx: ProjectContext, question: string): Promise<{ text: string; options?: Suggestion[] }>;
  clarify(ctx: ProjectContext, vague: string): Promise<{ text: string; options: Suggestion[] }>;
}

export interface AIImageProvider {
  readonly name: string;
  readonly isMock: boolean;
  generateStill(prompt: string, seed?: number): Promise<{ url: string; isPlaceholder: boolean }>;
}

export interface AIVideoProvider {
  readonly name: string;
  readonly isMock: boolean;
  generatePreview(frames: string[], prompt: string): Promise<{ status: "ready" | "placeholder"; frames: string[]; note: string }>;
}
