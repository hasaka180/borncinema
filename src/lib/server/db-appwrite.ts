import { Client, Databases, ID, Query } from "node-appwrite";
import type { NewStory, NewUser, Store, StoryDoc, StoryFilter, User, UserPatch } from "./db";
import { slugify } from "@/lib/utils";

/**
 * Appwrite backend. Satisfies the same `Store` contract as the JSON store.
 *
 * Appwrite has no JSON column, so `stats`, `review` and `project` travel as strings and are
 * parsed on the way out. Everything else maps to a native attribute.
 */

let cached: Databases | null = null;
function databases(): Databases {
  if (cached) return cached;
  const endpoint = process.env.APPWRITE_ENDPOINT;
  const project = process.env.APPWRITE_PROJECT_ID;
  const key = process.env.APPWRITE_API_KEY;
  if (!endpoint || !project || !key) {
    throw new Error("Appwrite is selected but APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID or APPWRITE_API_KEY is missing.");
  }
  cached = new Databases(new Client().setEndpoint(endpoint).setProject(project).setKey(key));
  return cached;
}

const DB = () => process.env.APPWRITE_DATABASE_ID || "borncinema";
const STORIES = () => process.env.APPWRITE_STORIES_COLLECTION || "stories";
const PROFILES = () => process.env.APPWRITE_PROFILES_COLLECTION || "profiles";

const PAGE = 100;

/** Appwrite 404s rather than returning null. */
async function orNull<T>(p: Promise<T>): Promise<T | null> {
  try { return await p; } catch { return null; }
}

const parse = <T,>(v: unknown, fallback: T): T => {
  if (typeof v !== "string" || !v) return fallback;
  try { return JSON.parse(v) as T; } catch { return fallback; }
};

const NO_STATS = { readers: 0, likes: 0, comments: 0, saves: 0, watchVotes: 0, completion: 0 };

type Doc = Record<string, unknown> & { $id: string; $createdAt: string; $updatedAt: string };

function outUser(d: Doc): User {
  return {
    id: d.$id,
    handle: String(d.handle || ""),
    name: String(d.name || ""),
    role: (d.role as User["role"]) || "creator",
    createdAt: d.$createdAt,
    email: (d.email as string) || undefined,
    passwordHash: (d.passwordHash as string) || undefined,
    bio: (d.bio as string) || undefined,
    makes: (d.makes as string[]) || undefined,
    genres: (d.genres as string[]) || undefined,
    location: (d.location as string) || undefined,
  };
}

function outStory(d: Doc): StoryDoc {
  return {
    id: d.$id,
    slug: String(d.slug || ""),
    title: String(d.title || ""),
    authorId: String(d.authorId || ""),
    authorName: String(d.authorName || ""),
    authorHandle: String(d.authorHandle || ""),
    cover: String(d.cover || ""),
    hook: String(d.hook || ""),
    synopsis: String(d.synopsis || ""),
    genre: String(d.genre || "Drama"),
    format: String(d.format || "Short Story"),
    tags: (d.tags as string[]) || [],
    language: String(d.language || "English"),
    rating: String(d.rating || "Everyone"),
    visibility: (d.visibility as StoryDoc["visibility"]) || "public",
    allowRemixes: Boolean(d.allowRemixes),
    paragraphs: (d.paragraphs as string[]) || [],
    status: (d.status as StoryDoc["status"]) || "draft",
    featured: Boolean(d.featured),
    createdAt: d.$createdAt,
    updatedAt: d.$updatedAt,
    submittedAt: (d.submittedAt as string) || undefined,
    publishedAt: (d.publishedAt as string) || undefined,
    review: parse<StoryDoc["review"]>(d.review, undefined),
    project: parse<unknown>(d.project, undefined),
    stats: parse(d.stats, NO_STATS),
  };
}

/** Strip synthetic fields and stringify the nested ones before writing. */
function inStory(s: Partial<StoryDoc>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const copy = ["slug", "title", "authorId", "authorName", "authorHandle", "cover", "hook", "synopsis",
    "genre", "format", "tags", "language", "rating", "visibility", "allowRemixes", "paragraphs",
    "status", "featured", "submittedAt", "publishedAt"] as const;
  for (const k of copy) if (k in s && s[k] !== undefined) out[k] = s[k];
  if ("stats" in s) out.stats = JSON.stringify(s.stats ?? NO_STATS);
  if ("review" in s) out.review = s.review ? JSON.stringify(s.review) : null;
  if ("project" in s) out.project = s.project ? JSON.stringify(s.project) : null;
  return out;
}

function inUser(u: Partial<User>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of ["handle", "name", "role", "email", "passwordHash", "bio", "makes", "genres", "location"] as const) {
    if (k in u && u[k] !== undefined) out[k] = u[k];
  }
  return out;
}

export const appwriteDb: Store = {
  async users() {
    const r = await databases().listDocuments({ databaseId: DB(), collectionId: PROFILES(), queries: [Query.limit(PAGE)] });
    return (r.documents as unknown as Doc[]).map(outUser);
  },

  async user(uid) {
    const d = await orNull(databases().getDocument({ databaseId: DB(), collectionId: PROFILES(), documentId: uid }));
    return d ? outUser(d as unknown as Doc) : null;
  },

  async userByHandle(handle) {
    const r = await databases().listDocuments({
      databaseId: DB(), collectionId: PROFILES(),
      queries: [Query.equal("handle", handle.toLowerCase()), Query.limit(1)],
    });
    const d = (r.documents as unknown as Doc[])[0];
    return d ? outUser(d) : null;
  },

  async userByEmail(email) {
    const r = await databases().listDocuments({
      databaseId: DB(), collectionId: PROFILES(),
      queries: [Query.equal("email", email.toLowerCase()), Query.limit(1)],
    });
    const d = (r.documents as unknown as Doc[])[0];
    return d ? outUser(d) : null;
  },

  async handleAvailable(handle) {
    return !(await appwriteDb.userByHandle(handle));
  },

  async createUser(input: NewUser) {
    const base = slugify(input.handle || input.name) || "creator";
    let handle = base;
    let n = 1;
    while (!(await appwriteDb.handleAvailable(handle))) handle = `${base}-${++n}`;
    const d = await databases().createDocument({
      databaseId: DB(), collectionId: PROFILES(), documentId: ID.unique(),
      data: inUser({
        handle, name: input.name, role: input.role || "creator", email: input.email?.toLowerCase(),
        passwordHash: input.passwordHash, bio: input.bio, makes: input.makes, genres: input.genres, location: input.location,
      }),
    });
    return outUser(d as unknown as Doc);
  },

  async updateUser(uid, patch: UserPatch) {
    const d = await orNull(databases().updateDocument({
      databaseId: DB(), collectionId: PROFILES(), documentId: uid, data: inUser(patch),
    }));
    return d ? outUser(d as unknown as Doc) : null;
  },

  async stories(filter: StoryFilter = {}) {
    const queries = [Query.orderDesc("$updatedAt"), Query.limit(PAGE)];
    if (filter.authorId) queries.push(Query.equal("authorId", filter.authorId));
    if (filter.status) queries.push(Query.equal("status", filter.status as string | string[]));
    const r = await databases().listDocuments({ databaseId: DB(), collectionId: STORIES(), queries });
    return (r.documents as unknown as Doc[]).map(outStory);
  },

  async story(sid) {
    const d = await orNull(databases().getDocument({ databaseId: DB(), collectionId: STORIES(), documentId: sid }));
    return d ? outStory(d as unknown as Doc) : null;
  },

  async storyBySlug(slug) {
    const r = await databases().listDocuments({
      databaseId: DB(), collectionId: STORIES(),
      queries: [Query.equal("slug", slug), Query.limit(1)],
    });
    const d = (r.documents as unknown as Doc[])[0];
    return d ? outStory(d) : null;
  },

  async createStory(input: NewStory) {
    const base = slugify(input.title) || "untitled";
    let slug = input.slug || base;
    let n = 1;
    while (await appwriteDb.storyBySlug(slug)) slug = `${base}-${++n}`;
    const d = await databases().createDocument({
      databaseId: DB(), collectionId: STORIES(), documentId: ID.unique(),
      data: inStory({ ...input, slug, stats: NO_STATS }),
    });
    return outStory(d as unknown as Doc);
  },

  async updateStory(sid, patch) {
    const d = await orNull(databases().updateDocument({
      databaseId: DB(), collectionId: STORIES(), documentId: sid, data: inStory(patch),
    }));
    return d ? outStory(d as unknown as Doc) : null;
  },

  async deleteStory(sid) {
    await orNull(databases().deleteDocument({ databaseId: DB(), collectionId: STORIES(), documentId: sid }));
  },
};
