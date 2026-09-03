# Connecting BORN CINEMA to real services

The prototype runs on three swappable layers. Each has a contract; you replace the
adapter behind it and nothing above changes.

| Layer | Contract | Today | Target |
|---|---|---|---|
| Database + accounts | `src/lib/server/db.ts` | JSON file in `.data/` | Appwrite |
| Image storage | `src/lib/services/index.ts` (`StorageService`) | object URLs | Cloudinary |
| Text AI | `src/lib/ai/types.ts` | local partner | OpenAI |

Do them in any order. OpenAI is the quickest (one key, no code).

---

## 1. OpenAI — 5 minutes, no code changes

The provider, prompts, server route and fallback are already written. You only add a key.

1. Go to <https://platform.openai.com/api-keys>, create a secret key, copy it.
   Add a few dollars of credit under Billing, or calls return 429.
2. Create `.env.local` in the project root (it is gitignored):

   ```bash
   OPENAI_API_KEY=sk-proj-your-key-here
   OPENAI_MODEL=gpt-4o-mini
   ```

3. Restart the dev server. Environment variables are read at boot, not on reload.

   ```bash
   npm run dev
   ```

4. Verify:
   - Visit <http://localhost:3000/api/ai/status> and expect `{"configured":true,...}`.
   - Open `/create`. Under the idea box the badge should read **OpenAI · gpt-4o-mini**
     instead of "Local creative partner".
   - Type an idea, press "Help me explore it". The interpretation now comes from the model.

**Which model.** `gpt-4o-mini` is the sensible default: cheap and fast enough for
suggestion lists. For the two calls where quality shows most, story composition and the
Story Partner, `gpt-4o` is noticeably better. To split them, edit
`src/app/api/ai/route.ts`:

```ts
const BIG_OPS = ["composeStory", "generateStructure", "partner"];
const model = BIG_OPS.includes(op)
  ? process.env.OPENAI_MODEL_LARGE || "gpt-4o"
  : process.env.OPENAI_MODEL || "gpt-4o-mini";
```

**How failure behaves.** If a call errors or returns malformed JSON, that single call
falls back to the local partner and logs a warning. The app never breaks, but the UI
keeps claiming OpenAI. Watch the server console while testing.

**Cost control.** Every prompt asks for strict JSON and the suggestion prompts cap the
item count, so responses stay small. Set a monthly limit under Billing → Limits.

**Never** put the key in `NEXT_PUBLIC_*`. It is read server-side in
`src/app/api/ai/route.ts` and must stay there.

---

## 2. Appwrite — database and accounts

### 2a. Create the project

1. Sign up at <https://cloud.appwrite.io> and create a project. Copy the **Project ID**.
2. Settings → **API keys** → Create key with scopes:
   `databases.read`, `databases.write`, `documents.read`, `documents.write`,
   and, if you use Appwrite Auth, `users.read`, `users.write`.
   Copy the secret once; it is not shown again.
3. Note your endpoint, usually `https://cloud.appwrite.io/v1` (or your region's).

### 2b. Create the database and collections

Databases → Create database, id `borncinema`.

**Collection `stories`** (id `stories`). Attributes:

| Key | Type | Size | Required | Notes |
|---|---|---|---|---|
| slug | string | 255 | yes | add a unique index |
| title | string | 255 | yes | |
| authorId | string | 64 | yes | index this |
| authorName | string | 120 | yes | |
| authorHandle | string | 64 | yes | |
| cover | string | 500 | no | Cloudinary URL later |
| hook | string | 500 | no | |
| synopsis | string | 2000 | no | |
| genre | string | 40 | yes | |
| format | string | 40 | yes | |
| tags | string[] | 40 | no | array |
| language | string | 40 | no | |
| rating | string | 20 | no | |
| visibility | enum | | yes | public, unlisted, private |
| allowRemixes | boolean | | no | |
| paragraphs | string[] | 100000 | yes | array, one entry per paragraph |
| status | enum | | yes | draft, submitted, published, rejected |
| featured | boolean | | no | |
| submittedAt | string | 40 | no | ISO date |
| publishedAt | string | 40 | no | ISO date |
| review | string | 2000 | no | JSON blob |
| stats | string | 1000 | no | JSON blob |

Indexes: unique on `slug`; key index on `authorId`; key index on `status`.

**Collection `profiles`** (id `profiles`) for the creative profile:
`handle` (string 64, unique index), `name` (string 120), `role` (enum: creator, superadmin),
`bio` (string 500), `location` (string 120), `makes` (string[] 60), `genres` (string[] 40),
`email` (string 255), `passwordHash` (string 255, only if you keep the current auth).

Permissions: start with collection-level "Any" read / "Users" write while developing,
then tighten to document-level once auth is wired.

### 2c. Install and configure

```bash
npm install node-appwrite
```

Add to `.env.local`:

```bash
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-secret-api-key
APPWRITE_DATABASE_ID=borncinema
APPWRITE_STORIES_COLLECTION=stories
APPWRITE_PROFILES_COLLECTION=profiles
```

### 2d. Write the adapter

Create `src/lib/server/db-appwrite.ts`. It must export an object with the same shape as
the `db` in `src/lib/server/db.ts`, so read that file first and match every method.

```ts
import { Client, Databases, ID, Query } from "node-appwrite";
import type { StoryDoc, User, Role } from "./db";
import { slugify } from "@/lib/utils";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DB = process.env.APPWRITE_DATABASE_ID!;
const STORIES = process.env.APPWRITE_STORIES_COLLECTION!;
const PROFILES = process.env.APPWRITE_PROFILES_COLLECTION!;

// Appwrite has no JSON column type, so the nested objects travel as strings.
const outStory = (d: any): StoryDoc => ({
  ...d,
  id: d.$id,
  createdAt: d.$createdAt,
  updatedAt: d.$updatedAt,
  stats: d.stats ? JSON.parse(d.stats) : { readers: 0, likes: 0, comments: 0, saves: 0, watchVotes: 0, completion: 0 },
  review: d.review ? JSON.parse(d.review) : undefined,
});

const inStory = (s: Partial<StoryDoc>) => {
  const { id, createdAt, updatedAt, stats, review, ...rest } = s as any;
  return {
    ...rest,
    ...(stats ? { stats: JSON.stringify(stats) } : {}),
    ...(review ? { review: JSON.stringify(review) } : {}),
  };
};

export const db = {
  async users(): Promise<User[]> {
    const r = await databases.listDocuments(DB, PROFILES, [Query.limit(100)]);
    return r.documents.map((d: any) => ({ ...d, id: d.$id, createdAt: d.$createdAt }));
  },

  async user(uid: string) {
    try {
      const d: any = await databases.getDocument(DB, PROFILES, uid);
      return { ...d, id: d.$id, createdAt: d.$createdAt } as User;
    } catch {
      return null;
    }
  },

  async userByHandle(handle: string) {
    const r = await databases.listDocuments(DB, PROFILES, [Query.equal("handle", handle.toLowerCase()), Query.limit(1)]);
    const d: any = r.documents[0];
    return d ? ({ ...d, id: d.$id, createdAt: d.$createdAt } as User) : null;
  },

  async userByEmail(email: string) {
    const r = await databases.listDocuments(DB, PROFILES, [Query.equal("email", email.toLowerCase()), Query.limit(1)]);
    const d: any = r.documents[0];
    return d ? ({ ...d, id: d.$id, createdAt: d.$createdAt } as User) : null;
  },

  async handleAvailable(handle: string) {
    return !(await db.userByHandle(handle));
  },

  async createUser(input: { name: string; role?: Role; email?: string; passwordHash?: string; handle?: string; bio?: string; makes?: string[]; genres?: string[]; location?: string }) {
    const base = slugify(input.handle || input.name) || "creator";
    let handle = base;
    let n = 1;
    while (!(await db.handleAvailable(handle))) handle = `${base}-${++n}`;
    const d: any = await databases.createDocument(DB, PROFILES, ID.unique(), {
      handle, name: input.name, role: input.role || "creator", email: input.email,
      passwordHash: input.passwordHash, bio: input.bio, makes: input.makes,
      genres: input.genres, location: input.location,
    });
    return { ...d, id: d.$id, createdAt: d.$createdAt } as User;
  },

  async updateUser(uid: string, patch: Partial<User>) {
    const { id, createdAt, ...rest } = patch as any;
    const d: any = await databases.updateDocument(DB, PROFILES, uid, rest);
    return { ...d, id: d.$id, createdAt: d.$createdAt } as User;
  },

  async stories(filter: { authorId?: string; status?: string | string[] } = {}) {
    const q = [Query.orderDesc("$updatedAt"), Query.limit(100)];
    if (filter.authorId) q.push(Query.equal("authorId", filter.authorId));
    if (filter.status) q.push(Query.equal("status", filter.status as any));
    const r = await databases.listDocuments(DB, STORIES, q);
    return r.documents.map(outStory);
  },

  async story(sid: string) {
    try {
      return outStory(await databases.getDocument(DB, STORIES, sid));
    } catch {
      return null;
    }
  },

  async storyBySlug(slug: string) {
    const r = await databases.listDocuments(DB, STORIES, [Query.equal("slug", slug), Query.limit(1)]);
    return r.documents[0] ? outStory(r.documents[0]) : null;
  },

  async createStory(input: any) {
    const base = slugify(input.title) || "untitled";
    let slug = base;
    let n = 1;
    while (await db.storyBySlug(slug)) slug = `${base}-${++n}`;
    const stats = { readers: 0, likes: 0, comments: 0, saves: 0, watchVotes: 0, completion: 0 };
    return outStory(await databases.createDocument(DB, STORIES, ID.unique(), inStory({ ...input, slug, stats })));
  },

  async updateStory(sid: string, patch: Partial<StoryDoc>) {
    return outStory(await databases.updateDocument(DB, STORIES, sid, inStory(patch)));
  },

  async deleteStory(sid: string) {
    await databases.deleteDocument(DB, STORIES, sid);
  },
};
```

### 2e. Switch over

In every file that imports the store, change the import path. They are:

```
src/lib/server/catalog.ts
src/lib/server/session.ts
src/app/api/auth/login/route.ts
src/app/api/auth/signup/route.ts
src/app/api/auth/me/route.ts
src/app/api/auth/handle/route.ts
src/app/api/stories/route.ts
src/app/api/stories/[id]/route.ts
src/app/api/review/[id]/route.ts
src/app/dashboard/**/page.tsx
src/app/story/[slug]/page.tsx
src/app/profile/[handle]/page.tsx
```

Rather than editing all of them, make `src/lib/server/db.ts` re-export the chosen backend:

```ts
// at the bottom of db.ts, after the existing local implementation
export const db = process.env.APPWRITE_PROJECT_ID
  ? (require("./db-appwrite").db as typeof localDb)
  : localDb;
```

Rename the current `export const db = {...}` to `const localDb = {...}` for this to work.
Now the store follows the environment, and removing the Appwrite variables returns you to
the JSON file.

### 2f. Optional: use Appwrite Auth instead of the built-in sessions

The current auth (scrypt in `src/lib/server/password.ts`, signed cookie in
`src/lib/server/session.ts`) works and needs no service. Moving to Appwrite Auth gets you
email verification, password reset, and OAuth for free.

The shape of the change:

- Signup calls `account.create()` (client SDK, `appwrite` package) then creates the
  matching `profiles` document keyed by the Appwrite user id.
- Login calls `account.createEmailPasswordSession()`; Appwrite sets its own cookie.
- `getSession()` in `session.ts` becomes `account.get()` on a client configured with the
  request's session, then loads the `profiles` document for role, handle and bio.
- Delete `password.ts` and the `bc_session` cookie logic.
- `src/middleware.ts` checks Appwrite's cookie (`a_session_<projectId>`) instead of
  `bc_session`.

Keep `role` in the `profiles` document, not in Appwrite user prefs, so the review queue
check stays a single read.

### 2g. Seeding

The 12 demo stories in `src/lib/data/stories.ts` stay in code and always appear; member
stories merge in through `getPublicStories()` in `src/lib/server/catalog.ts`. Nothing to
migrate. If you later want the demo content in Appwrite too, write a one-off script that
loops `stories` and calls `db.createStory` with `status: "published"`.

---

## 3. Cloudinary — image storage

Right now story covers are picked from a fixed Unsplash list. Cloudinary lets creators
upload their own.

### 3a. Account and credentials

1. Sign up at <https://cloudinary.com>. The dashboard shows **Cloud name**, **API key**,
   **API secret**.
2. Add to `.env.local`:

   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   ```

   Only the cloud name is public. The secret stays server-side.

### 3b. Allow the domain

`next.config.mjs`, add to `images.remotePatterns`:

```js
{ protocol: "https", hostname: "res.cloudinary.com" }
```

### 3c. Signed uploads

Signed uploads keep the secret on the server and stop strangers filling your account.

```bash
npm install cloudinary
```

Create `src/app/api/upload/route.ts`:

```ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getSession } from "@/lib/server/session";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Signs one upload for the signed-in creator. Members only. */
export async function POST() {
  const me = await getSession();
  if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const timestamp = Math.round(Date.now() / 1000);
  const folder = `borncinema/covers/${me.id}`;
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({
    signature, timestamp, folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
```

### 3d. Upload from the cover picker

In `src/app/dashboard/stories/[id]/EditorClient.tsx`, beside the preset covers:

```tsx
const [uploading, setUploading] = useState(false);

const uploadCover = async (file: File) => {
  setUploading(true);
  try {
    const sig = await fetch("/api/upload", { method: "POST" }).then((r) => r.json());
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sig.apiKey);
    body.append("timestamp", sig.timestamp);
    body.append("signature", sig.signature);
    body.append("folder", sig.folder);

    const r = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: "POST",
      body,
    });
    const d = await r.json();
    if (d.secure_url) set("cover", d.secure_url);
  } finally {
    setUploading(false);
  }
};
```

```tsx
<label className="btn btn-sm cursor-pointer mt-3">
  {uploading ? "Uploading…" : "Upload a cover"}
  <input
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
  />
</label>
```

The same call works in `src/components/create/PublishFlow.tsx`.

### 3e. Let Cloudinary do the grading

Cloudinary transforms in the URL, so you can drop the delivered weight considerably.
Add a helper in `src/lib/utils.ts`:

```ts
/** Cloudinary delivery: right size, auto format, auto quality. */
export function cld(url: string, width = 1600) {
  if (!url.includes("/res.cloudinary.com/") || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_fill/`);
}
```

Then in `src/components/ui/Still.tsx`, pass `src` through `cld()` before rendering. Themes
already grade images with CSS filters, so leave colour alone here.

### 3f. Fill in the storage service

`src/lib/services/index.ts` declares `StorageService` with a local stub. Replace
`localStorageService` with a Cloudinary implementation so the rest of the app has one path
for uploads:

```ts
export const cloudinaryStorage: StorageService = {
  async upload(file: Blob, path: string) {
    const sig = await fetch("/api/upload", { method: "POST" }).then((r) => r.json());
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sig.apiKey);
    body.append("timestamp", sig.timestamp);
    body.append("signature", sig.signature);
    body.append("folder", sig.folder);
    const r = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: "POST", body });
    const d = await r.json();
    return { url: d.secure_url };
  },
};
```

### 3g. Storyboard frames

`src/lib/ai/providers/mock-media.ts` returns placeholder stills. When you add a real image
model, have the server upload its output to Cloudinary and return the `secure_url`, so
frames survive past the model's temporary links.

---

## 4. Environment summary

`.env.local`, never committed:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=...
APPWRITE_API_KEY=...
APPWRITE_DATABASE_ID=borncinema
APPWRITE_STORIES_COLLECTION=stories
APPWRITE_PROFILES_COLLECTION=profiles

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...

# Sessions (only while using the built-in auth)
SESSION_SECRET=a-long-random-string
```

When you deploy, add the same variables in your host's dashboard. On Vercel that is
Settings → Environment Variables. `.env.local` is not uploaded.

---

## 5. Order of work, and how to check each step

1. **OpenAI.** Key in, restart, badge reads OpenAI, an idea gets a real interpretation.
2. **Cloudinary.** Upload a cover in the dashboard editor, confirm the story page shows a
   `res.cloudinary.com` URL and the image loads.
3. **Appwrite.** Sign up as a new creator, submit a story, approve it as the Editorial
   Desk, confirm the document appears in the Appwrite console and the story is live.
4. **Appwrite Auth**, only if you want verification and reset.

After each step, run a build before moving on:

```bash
NEXT_DIST_DIR=.next-build npm run build
```

Building into `.next-build` keeps `npm run dev` alive on port 3000.

## 6. Things that will bite

- **Restart after env changes.** Next reads them at boot; a hot reload will not pick them up.
- **Appwrite has no JSON type.** `stats` and `review` must be stringified going in and
  parsed coming out. The adapter above does it; keep it that way if you add fields.
- **Appwrite string attributes have a size limit.** `paragraphs` is an array of strings;
  give it a large per-item size or long stories will be rejected on write.
- **Appwrite `listDocuments` defaults to 25.** Always pass `Query.limit`, and paginate with
  `Query.cursorAfter` once you have real volume.
- **Cloudinary free tier is generous but finite.** Use `f_auto,q_auto` from the start.
- **Do not expose secrets.** Only `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` belongs in the browser.
  The OpenAI key, Appwrite API key and Cloudinary secret are all server-side.
- **Two sources of truth for stories.** Demo stories live in code, member stories in the
  database, and `getPublicStories()` merges them. If you want only real data, empty the
  demo array rather than deleting the merge.
