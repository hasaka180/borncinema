import { promises as fs } from "fs";
import path from "path";
import { slugify } from "@/lib/utils";

/**
 * Server-side JSON store for the prototype. Swap for a real database by re-implementing these
 * functions; nothing above this layer knows it is a file.
 */
export type Role = "creator" | "superadmin";
export interface User {
  id: string; handle: string; name: string; role: Role; createdAt: string;
  email?: string; passwordHash?: string; bio?: string; makes?: string[]; genres?: string[]; location?: string;
}
/** What leaves the server. Never the password hash. */
export type PublicUser = Omit<User, "passwordHash">;
export const publicUser = (u: User): PublicUser => { const { passwordHash: _p, ...rest } = u; return rest; };
export type StoryStatus = "draft" | "submitted" | "published" | "rejected";
export interface StoryDoc {
  id: string; slug: string; title: string;
  authorId: string; authorName: string; authorHandle: string;
  cover: string; hook: string; synopsis: string; genre: string; format: string; tags: string[]; language: string; rating: string;
  visibility: "public" | "unlisted" | "private"; allowRemixes: boolean;
  paragraphs: string[];
  status: StoryStatus; featured?: boolean;
  createdAt: string; updatedAt: string; submittedAt?: string; publishedAt?: string;
  review?: { by: string; at: string; note: string; decision: "approve" | "reject" };
  project?: unknown;
  stats: { readers: number; likes: number; comments: number; saves: number; watchVotes: number; completion: number };
}
interface Db { users: User[]; stories: StoryDoc[] }

const DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "db.json");

const seed = (): Db => ({
  users: [
    { id: "u_admin", handle: "editorial", name: "Editorial Desk", role: "superadmin", bio: "Reads every story before it goes public.", createdAt: "2026-01-01T00:00:00Z" },
    { id: "u_mara", handle: "maravoss", name: "Mara Voss", role: "creator", bio: "I write about the hours nobody is awake for.", createdAt: "2026-01-01T00:00:00Z" },
    { id: "u_tariq", handle: "tariqel", name: "Tariq El-Amin", role: "creator", bio: "Cities that pretend to be finished.", createdAt: "2026-01-01T00:00:00Z" },
  ],
  stories: [],
});

let cache: Db | null = null;
let writing: Promise<void> = Promise.resolve();

async function load(): Promise<Db> {
  if (cache) return cache;
  try { cache = JSON.parse(await fs.readFile(FILE, "utf8")); }
  catch { cache = seed(); await persist(); }
  return cache!;
}
async function persist() {
  const snapshot = JSON.stringify(cache, null, 2);
  writing = writing.then(async () => { await fs.mkdir(DIR, { recursive: true }); await fs.writeFile(FILE, snapshot, "utf8"); });
  await writing;
}

const id = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const db = {
  async users() { return (await load()).users; },
  async user(uid: string) { return (await load()).users.find((u) => u.id === uid) || null; },
  async userByHandle(handle: string) { return (await load()).users.find((u) => u.handle.toLowerCase() === handle.toLowerCase()) || null; },
  async userByEmail(email: string) { return (await load()).users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null; },
  async handleAvailable(handle: string) { return !(await db.userByHandle(handle)); },
  async createUser(input: { name: string; role?: Role; email?: string; passwordHash?: string; handle?: string; bio?: string; makes?: string[]; genres?: string[]; location?: string }) {
    const d = await load();
    const base = slugify(input.handle || input.name) || "creator";
    let handle = base; let n = 1;
    while (d.users.some((u) => u.handle === handle)) handle = `${base}-${++n}`;
    const u: User = { id: id("u"), handle, name: input.name, role: input.role || "creator", createdAt: new Date().toISOString(), email: input.email, passwordHash: input.passwordHash, bio: input.bio, makes: input.makes, genres: input.genres, location: input.location };
    d.users.push(u); await persist(); return u;
  },
  async updateUser(uid: string, patch: Partial<Pick<User, "name" | "bio" | "makes" | "genres" | "location" | "passwordHash">>) {
    const d = await load();
    const i = d.users.findIndex((u) => u.id === uid); if (i < 0) return null;
    d.users[i] = { ...d.users[i], ...patch }; await persist(); return d.users[i];
  },
  async stories(filter: { authorId?: string; status?: StoryStatus | StoryStatus[] } = {}) {
    const d = await load();
    return d.stories.filter((s) => (!filter.authorId || s.authorId === filter.authorId) && (!filter.status || (Array.isArray(filter.status) ? filter.status.includes(s.status) : s.status === filter.status)))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
  async story(sid: string) { return (await load()).stories.find((s) => s.id === sid) || null; },
  async storyBySlug(slug: string) { return (await load()).stories.find((s) => s.slug === slug) || null; },
  async createStory(input: Omit<StoryDoc, "id" | "slug" | "createdAt" | "updatedAt" | "stats"> & { slug?: string }) {
    const d = await load();
    const base = slugify(input.title) || "untitled"; let slug = base; let n = 1;
    while (d.stories.some((s) => s.slug === slug)) slug = `${base}-${++n}`;
    const now = new Date().toISOString();
    const doc: StoryDoc = { ...input, id: id("s"), slug, createdAt: now, updatedAt: now, stats: { readers: 0, likes: 0, comments: 0, saves: 0, watchVotes: 0, completion: 0 } };
    d.stories.push(doc); await persist(); return doc;
  },
  async updateStory(sid: string, patch: Partial<StoryDoc>) {
    const d = await load();
    const i = d.stories.findIndex((s) => s.id === sid); if (i < 0) return null;
    d.stories[i] = { ...d.stories[i], ...patch, updatedAt: new Date().toISOString() };
    await persist(); return d.stories[i];
  },
  async deleteStory(sid: string) { const d = await load(); d.stories = d.stories.filter((s) => s.id !== sid); await persist(); },
};
