"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import type { ComposedStory, ProjectContext, Shot, StoryStructure, VisualDirection } from "@/lib/ai/types";

export type Step =
  | "idea" | "interpret" | "name" | "location" | "locationDetail" | "desire" | "fear" | "secret"
  | "direction" | "structure" | "compose" | "read" | "publish" | "published" | "cinema";

export interface Version { id: string; n: number; label: string; at: string; snapshot: Partial<ProjectState> }

export interface Character { id: string; name: string; age?: string; occupation?: string; personality?: string; appearance?: string; background?: string; desire?: string; fear?: string; secret?: string; arc?: string; relationships?: string[] }
export interface Location { id: string; name: string; detail?: string; real: boolean; country?: string; atmosphere?: string; period?: string }
export interface Scene { id: string; act: number; title: string; text: string; characters: string[]; locationId?: string }

export interface ProjectState {
  id: string;
  step: Step;
  idea: string;
  interpretation?: { genre: string; mood: string; summary: string; firstQuestion: string };
  characters: Character[];
  locations: Location[];
  direction?: string;
  tone?: string;
  structure?: StoryStructure;
  scenes: Scene[];
  story?: ComposedStory;
  title?: string;
  cover?: string;
  publish?: { genre: string; format: string; tags: string[]; rating: string; language: string; visibility: "public" | "unlisted" | "private"; description: string; allowRemixes: boolean; publishedAt?: string; slug?: string; status?: "submitted" | "published" | "local"; storyId?: string };
  community: { readers: number; likes: number; comments: number; saves: number; watchVotes: number; completion: number };
  film?: { stage: number; styleKey?: string; visual?: VisualDirection; shots?: Shot[]; treatment?: string; runtime?: string; format?: string; directorVision?: string };
  versions: Version[];
  choices: string[];
  updatedAt: string;
}

const empty = (): ProjectState => ({
  id: `p_${Date.now().toString(36)}`,
  step: "idea", idea: "", characters: [], locations: [], scenes: [], versions: [], choices: [],
  community: { readers: 0, likes: 0, comments: 0, saves: 0, watchVotes: 0, completion: 0 },
  updatedAt: new Date().toISOString(),
});

type Action =
  | { type: "reset" }
  | { type: "hydrate"; state: ProjectState }
  | { type: "patch"; patch: Partial<ProjectState>; version?: string }
  | { type: "step"; step: Step }
  | { type: "choice"; text: string }
  | { type: "upsertCharacter"; character: Character }
  | { type: "upsertLocation"; location: Location }
  | { type: "setScenes"; scenes: Scene[] }
  | { type: "restore"; versionId: string };

function snapshotOf(s: ProjectState): Partial<ProjectState> {
  const copy: Partial<ProjectState> = { ...s };
  delete copy.versions;
  return copy;
}

function reducer(s: ProjectState, a: Action): ProjectState {
  const now = new Date().toISOString();
  switch (a.type) {
    case "reset": return empty();
    case "hydrate": return a.state;
    case "step": return { ...s, step: a.step, updatedAt: now };
    case "choice": return { ...s, choices: [...s.choices, a.text], updatedAt: now };
    case "upsertCharacter": {
      const exists = s.characters.some((c) => c.id === a.character.id);
      return { ...s, characters: exists ? s.characters.map((c) => (c.id === a.character.id ? { ...c, ...a.character } : c)) : [...s.characters, a.character], updatedAt: now };
    }
    case "upsertLocation": {
      const exists = s.locations.some((l) => l.id === a.location.id);
      return { ...s, locations: exists ? s.locations.map((l) => (l.id === a.location.id ? { ...l, ...a.location } : l)) : [...s.locations, a.location], updatedAt: now };
    }
    case "setScenes": return { ...s, scenes: a.scenes, updatedAt: now };
    case "patch": {
      const next = { ...s, ...a.patch, updatedAt: now };
      if (a.version) {
        const v: Version = { id: `v${Date.now().toString(36)}`, n: s.versions.length + 1, label: a.version, at: now, snapshot: snapshotOf(s) };
        next.versions = [...s.versions, v];
      }
      return next;
    }
    case "restore": {
      const v = s.versions.find((x) => x.id === a.versionId);
      if (!v) return s;
      const restorePoint: Version = { id: `v${Date.now().toString(36)}`, n: s.versions.length + 1, label: `Before restoring v${String(v.n).padStart(2, "0")}`, at: now, snapshot: snapshotOf(s) };
      return { ...s, ...v.snapshot, versions: [...s.versions, restorePoint], updatedAt: now };
    }
  }
}

interface Ctx {
  project: ProjectState;
  dispatch: React.Dispatch<Action>;
  ctx: ProjectContext;
  protagonist?: Character;
  primaryLocation?: Location;
}

const ProjectCtx = createContext<Ctx | null>(null);
const KEY = "bc-project";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, dispatch] = useReducer(reducer, undefined, empty);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) }); } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(project)); } catch {} }, [project]);

  const protagonist = project.characters[0];
  const primaryLocation = project.locations[0];
  const ctx: ProjectContext = useMemo(() => ({
    idea: project.idea,
    genreHint: project.interpretation?.genre,
    protagonist: protagonist ? { name: protagonist.name, desire: protagonist.desire, fear: protagonist.fear, secret: protagonist.secret, occupation: protagonist.occupation, age: protagonist.age } : undefined,
    location: primaryLocation ? { name: primaryLocation.name, detail: primaryLocation.detail } : undefined,
    direction: project.direction, tone: project.tone, choices: project.choices,
  }), [project, protagonist, primaryLocation]);

  return <ProjectCtx.Provider value={{ project, dispatch, ctx, protagonist, primaryLocation }}>{children}</ProjectCtx.Provider>;
}

export function useProject() {
  const c = useContext(ProjectCtx);
  if (!c) throw new Error("useProject outside provider");
  const { dispatch } = c;
  const patch = useCallback((p: Partial<ProjectState>, version?: string) => dispatch({ type: "patch", patch: p, version }), [dispatch]);
  const go = useCallback((step: Step) => dispatch({ type: "step", step }), [dispatch]);
  return { ...c, patch, go };
}
