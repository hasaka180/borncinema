import type { FilmProject } from "../types";
import { IMG } from "./images";

export const films: FilmProject[] = [
  {
    id: "f1", slug: "the-last-elevator", storyId: "s1", title: "The Last Elevator",
    logline: "A night-shift train driver stops at a sealed station to confront the elevator that has appeared there every night for a year, and the woman inside it who is wearing her coat.",
    genre: "Sci-Fi", runtime: "94 min", format: "Feature Film", visualStyle: "Neo-noir",
    directorVision: "One location, one night, one face. The tunnel is a throat. We never see the surface. Sodium light, wet concrete, and the elevator glowing like a hospital corridor at 4 a.m.",
    stage: 6, poster: IMG.subway, frames: [IMG.tunnel, IMG.corridor, IMG.station, IMG.rain],
    anticipation: 96, palette: ["#0a0a0c", "#2b2f36", "#d6a24d", "#3d9a99", "#f1ede6"],
  },
  {
    id: "f2", slug: "the-city-that-forgot-tomorrow", storyId: "s2", title: "The City That Forgot Tomorrow",
    logline: "In a Dubai where the weather is scheduled by law, a junior forecaster discovers the day after tomorrow has gone blank, and her grandmother's condemned house in the old city may be the only place still expecting rain.",
    genre: "Sci-Fi", runtime: "6 × 48 min", format: "Limited Series", visualStyle: "Realistic",
    directorVision: "Two cities in one frame. The new city is shot on long lenses, compressed and airless. The old city is handheld, close, breathing. The colour of the sky is a character.",
    stage: 3, poster: IMG.dubaiNight, frames: [IMG.dubai, IMG.desert, IMG.city, IMG.sunset],
    anticipation: 89, palette: ["#0c1117", "#c9963f", "#e9dcc4", "#3f6fa6", "#1f1613"],
  },
  {
    id: "f3", slug: "the-house-without-windows", storyId: "s4", title: "The House Without Windows",
    logline: "A grieving son inherits a house his family swore was demolished. It has no windows, no records, and somebody has been cooking in it.",
    genre: "Horror", runtime: "88 min", format: "Feature Film", visualStyle: "Period drama",
    directorVision: "Natural light only, which means almost none. The house is lit by what the character carries. Every shot is composed around the absence of a window.",
    stage: 2, poster: IMG.oldBuilding, frames: [IMG.corridor, IMG.fogForest, IMG.rain, IMG.windowLight],
    anticipation: 84, palette: ["#17100d", "#4a3b2f", "#8f3a3a", "#cf9b45", "#f4e8d4"],
  },
  {
    id: "f4", slug: "the-ocean-between-us", storyId: "s8", title: "The Ocean Between Us",
    logline: "Two estranged sisters on opposite coasts of the Atlantic record voice notes to each other for a year. They never send them. Until one of them does.",
    genre: "Drama", runtime: "102 min", format: "Feature Film", visualStyle: "Indie film",
    directorVision: "Split geography, single rhythm. Lagos in 16mm warmth, Baltimore in digital cold. Voice notes carry across cuts so the sisters are always in each other's frames without knowing.",
    stage: 4, poster: IMG.waves, frames: [IMG.ocean, IMG.bridge, IMG.windowLight, IMG.street],
    anticipation: 87, palette: ["#0c1117", "#79b8cf", "#e7edf3", "#b5702a", "#16212d"],
  },
  {
    id: "f5", slug: "the-cartographer-of-lost-streets", storyId: "s9", title: "The Cartographer of Lost Streets",
    logline: "A courier who can walk London's demolished streets must outrun a developer who wants to build over the last one.",
    genre: "Fantasy", runtime: "96 min", format: "Animated Feature", visualStyle: "Animation",
    directorVision: "Ink and soot. Present-day London in clean line; the lost streets in rough charcoal that smudges when characters move too fast. The map itself is animated by hand.",
    stage: 5, poster: IMG.street, frames: [IMG.city, IMG.bridge, IMG.hotel, IMG.rain],
    anticipation: 82, palette: ["#0b0b0b", "#3b3b3b", "#8a2c2c", "#f6f4ef", "#d6a24d"],
  },
  {
    id: "f6", slug: "the-projectionist", storyId: "s12", title: "The Projectionist",
    logline: "On the last night of a cinema in 1979, the projectionist threads a reel nobody sent him, and the woman on screen is sitting in the back row.",
    genre: "Drama", runtime: "24 min", format: "Short Film", visualStyle: "Period drama",
    directorVision: "Shot on 16mm, projected in the film. The booth is the whole world. We only ever see the screen reflected in his glasses.",
    stage: 7, poster: IMG.projector, frames: [IMG.cinema, IMG.curtain, IMG.neon, IMG.street],
    anticipation: 90, palette: ["#1f1613", "#cf9b45", "#8f3a3a", "#f4e8d4", "#0a0a0c"],
  },
];

export const filmBySlug = (slug: string) => films.find((f) => f.slug === slug);
export const filmById = (id: string) => films.find((f) => f.id === id);

export const FILM_STAGES = [
  { n: 1, key: "story", label: "Story", desc: "The finished text. Everything begins here." },
  { n: 2, key: "treatment", label: "Treatment", desc: "The story told as a film, in prose, scene by scene." },
  { n: 3, key: "screenplay", label: "Screenplay", desc: "Scenes, dialogue, action. The blueprint." },
  { n: 4, key: "characters", label: "Characters", desc: "Castable people with faces, voices, and wardrobes." },
  { n: 5, key: "locations", label: "Locations", desc: "Where the camera stands. Real or built." },
  { n: 6, key: "visual", label: "Visual Language", desc: "Palette, lenses, light, movement." },
  { n: 7, key: "storyboard", label: "Storyboard", desc: "Shot by shot. The film before the film." },
  { n: 8, key: "preview", label: "Cinematic Preview", desc: "A moving impression of the finished work." },
];
