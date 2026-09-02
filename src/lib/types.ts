export type Genre =
  | "Drama" | "Thriller" | "Horror" | "Sci-Fi" | "Romance" | "Comedy" | "Mystery"
  | "Fantasy" | "Crime" | "Adventure" | "Historical" | "Animation" | "Documentary" | "Experimental";

export type Format = "Short Story" | "Novel" | "Novella" | "Poetry" | "Article" | "Non-Fiction";
export type Mood = "Melancholic" | "Tense" | "Hopeful" | "Eerie" | "Playful" | "Elegiac" | "Feverish" | "Quiet";
export type Visibility = "public" | "unlisted" | "private";

export interface Author {
  id: string;
  handle: string;
  name: string;
  role: string;
  bio: string;
  location: string;
  avatar: string;
  followers: number;
  following: number;
  creativeDNA: { genres: Genre[]; themes: string[]; styles: string[]; influences: string[] };
}

export interface Chapter { id: string; title: string; paragraphs: string[] }

export interface Story {
  id: string;
  slug: string;
  title: string;
  authorId: string;
  genre: Genre;
  subgenre?: string;
  format: Format;
  mood: Mood;
  language: string;
  readingTime: number; // minutes
  synopsis: string;
  hook: string;
  cover: string;
  stills: string[];
  tags: string[];
  publishedAt: string;
  stats: { readers: number; likes: number; comments: number; saves: number; watchVotes: number; completion: number };
  screenability: number;
  chapters: Chapter[];
  allowRemixes: boolean;
  featured?: boolean;
  staffPick?: boolean;
  newVoice?: boolean;
  inDevelopment?: boolean;
  filmProjectId?: string;
  /** Present for member stories; demo stories resolve authors by id. */
  author?: { name: string; handle: string; role?: string; avatar?: string };
}

export interface Comment {
  id: string;
  storyId: string;
  authorId: string;
  paragraph?: number;
  chapter?: number;
  text: string;
  likes: number;
  createdAt: string;
}

export interface Discussion {
  id: string;
  storyId: string;
  authorId: string;
  question: string;
  replies: number;
  lastActive: string;
  excerpt: string;
}

export interface FanCast {
  id: string;
  storyId: string;
  authorId: string;
  director: string;
  lead: string;
  cinematography: string;
  music: string;
  likes: number;
  note: string;
}

export interface FilmProject {
  id: string;
  slug: string;
  storyId: string;
  title: string;
  logline: string;
  genre: Genre;
  runtime: string;
  format: "Feature Film" | "Short Film" | "Limited Series" | "Animated Feature";
  visualStyle: string;
  directorVision: string;
  stage: number; // 1..8
  poster: string;
  frames: string[];
  anticipation: number;
  palette: string[];
}

export interface Idea {
  id: string;
  text: string;
  createdAt: string;
  tags: string[];
  status: "seed" | "developing" | "story" | "archived";
  connections?: string[];
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "remix" | "cast" | "screenability" | "milestone" | "featured";
  text: string;
  storyId?: string;
  authorId?: string;
  createdAt: string;
  read: boolean;
}
