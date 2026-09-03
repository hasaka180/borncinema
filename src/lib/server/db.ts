import { promises as fs } from "fs";
import path from "path";
import { slugify } from "@/lib/utils";
import { appwriteDb } from "./db-appwrite";

/**
 * The store. Two implementations satisfy the same `Store` contract:
 * a JSON file for local work, and Appwrite when its environment variables are present.
 * Nothing above this layer knows which one it is talking to.
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
export type NewUser = { name: string; role?: Role; email?: string; passwordHash?: string; handle?: string; bio?: string; makes?: string[]; genres?: string[]; location?: string };
export type NewStory = Omit<StoryDoc, "id" | "slug" | "createdAt" | "updatedAt" | "stats"> & { slug?: string };
export type UserPatch = Partial<Pick<User, "name" | "bio" | "makes" | "genres" | "location" | "passwordHash">>;
export type StoryFilter = { authorId?: string; status?: StoryStatus | StoryStatus[] };

/** Every backend must provide exactly this. */
export interface Store {
  users(): Promise<User[]>;
  user(uid: string): Promise<User | null>;
  userByHandle(handle: string): Promise<User | null>;
  userByEmail(email: string): Promise<User | null>;
  handleAvailable(handle: string): Promise<boolean>;
  createUser(input: NewUser): Promise<User>;
  updateUser(uid: string, patch: UserPatch): Promise<User | null>;
  stories(filter?: StoryFilter): Promise<StoryDoc[]>;
  story(sid: string): Promise<StoryDoc | null>;
  storyBySlug(slug: string): Promise<StoryDoc | null>;
  createStory(input: NewStory): Promise<StoryDoc>;
  updateStory(sid: string, patch: Partial<StoryDoc>): Promise<StoryDoc | null>;
  deleteStory(sid: string): Promise<void>;
}

interface Db { users: User[]; stories: StoryDoc[] }

/**
 * Where the JSON store lives. Serverless hosts mount a read-only filesystem outside the
 * temp directory, so BC_DATA_DIR lets a deployment point this somewhere writable.
 */
const DIR = process.env.BC_DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "db.json");

/** Set once the filesystem refuses a write: from then on the store is memory-only. */
let readOnly = false;
let warned = false;
export const storeIsPersistent = () => !readOnly;

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
  try {
    cache = JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    cache = seed();
    await persist();
  }
  return cache!;
}

/**
 * Best effort. If the filesystem is read-only the seeded data stays in memory and the app
 * keeps serving, rather than throwing out of every page that touches the store.
 */
async function persist() {
  if (readOnly) return;
  const snapshot = JSON.stringify(cache, null, 2);
  writing = writing
    .then(async () => {
      await fs.mkdir(DIR, { recursive: true });
      await fs.writeFile(FILE, snapshot, "utf8");
    })
    .catch((e) => {
      readOnly = true;
      if (!warned) {
        warned = true;
        console.warn(
          `[store] cannot write ${FILE} (${(e as Error).message}). Running memory-only: ` +
            "nothing members create will survive a restart. Configure Appwrite, or set BC_DATA_DIR " +
            "to a writable path, for a deployment.",
        );
      }
    });
  await writing;
}

const id = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const localDb: Store = {
  async users() { return (await load()).users; },
  async user(uid: string) { return (await load()).users.find((u) => u.id === uid) || null; },
  async userByHandle(handle: string) { return (await load()).users.find((u) => u.handle.toLowerCase() === handle.toLowerCase()) || null; },
  async userByEmail(email: string) { return (await load()).users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) || null; },
  async handleAvailable(handle: string) { return !(await localDb.userByHandle(handle)); },
  async createUser(input: NewUser) {
    const d = await load();
    const base = slugify(input.handle || input.name) || "creator";
    let handle = base; let n = 1;
    while (d.users.some((u) => u.handle === handle)) handle = `${base}-${++n}`;
    const u: User = { id: id("u"), handle, name: input.name, role: input.role || "creator", createdAt: new Date().toISOString(), email: input.email, passwordHash: input.passwordHash, bio: input.bio, makes: input.makes, genres: input.genres, location: input.location };
    d.users.push(u); await persist(); return u;
  },
  async updateUser(uid: string, patch: UserPatch) {
    const d = await load();
    const i = d.users.findIndex((u) => u.id === uid); if (i < 0) return null;
    d.users[i] = { ...d.users[i], ...patch }; await persist(); return d.users[i];
  },
  async stories(filter: StoryFilter = {}) {
    const d = await load();
    return d.stories.filter((s) => (!filter.authorId || s.authorId === filter.authorId) && (!filter.status || (Array.isArray(filter.status) ? filter.status.includes(s.status) : s.status === filter.status)))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },
  async story(sid: string) { return (await load()).stories.find((s) => s.id === sid) || null; },
  async storyBySlug(slug: string) { return (await load()).stories.find((s) => s.slug === slug) || null; },
  async createStory(input: NewStory) {
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

/**
 * Pick the backend from the environment. With no Appwrite variables the JSON store is used,
 * so the prototype keeps working out of the box and unsetting them is a complete rollback.
 * Importing the Appwrite module is harmless without credentials: it builds its client lazily
 * on first use, so nothing connects until a call is actually made.
 */
export const db: Store = process.env.APPWRITE_PROJECT_ID ? appwriteDb : localDb;

export const backendName = process.env.APPWRITE_PROJECT_ID ? "appwrite" : "local-json";
