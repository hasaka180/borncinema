# Deploying, and connecting Appwrite + image storage

## Why the Vercel deploy threw "a server-side exception"

The prototype stored everything in `.data/db.json`. Two things made that fatal in production:

1. `.data/` is gitignored, so the file was never in the deployment.
2. Vercel's filesystem is **read-only** outside `/tmp`.

So on the first request the store tried to seed itself, tried to write the file, the write threw,
and every page that reads the store — including `/` — returned a 500.

That is now fixed. Writes are best effort: if the filesystem refuses, the store keeps the seeded
data in memory, logs one warning, and the site serves normally. Check any deployment with:

    https://<your-app>/api/health

```json
{ "backend": "local-json", "ok": true, "persistent": false,
  "note": "Filesystem is read-only. Serving in memory; member data will not survive a restart." }
```

`persistent: false` means signups and stories vanish on the next cold start. Fine for a demo,
not for real use — which is what Appwrite is for.

---

## 1. Appwrite

### Create the project

1. Sign up at <https://cloud.appwrite.io>, create a project, copy the **Project ID**.
2. **Overview → Integrations → API Keys → Create API key.** Give it the scopes
   `databases.read`, `databases.write`, `collections.read`, `collections.write`,
   `attributes.read`, `attributes.write`, `indexes.read`, `indexes.write`,
   `documents.read`, `documents.write`. Copy the secret; it is shown once.
3. Note the endpoint, usually `https://cloud.appwrite.io/v1` (regional projects differ, e.g.
   `https://fra.cloud.appwrite.io/v1` — copy it from the console).

### Point the app at it

Create `.env.local`:

```bash
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-server-api-key
APPWRITE_DATABASE_ID=borncinema
```

### Build the schema

Do not create the collections by hand. Run:

```bash
npm run appwrite:setup
```

It creates the database, the `profiles` and `stories` collections, all attributes, the indexes,
and seeds the three demo accounts. It is idempotent, so re-run it whenever you change the schema;
it only adds what is missing and never deletes.

Expected output ends with `Done. Start the app and it will use Appwrite:`.

### Verify

```bash
npm run dev
```

- `http://localhost:3000/api/health` should report `"backend": "appwrite"`, `"persistent": true`,
  and `"users": 3`.
- Sign up at `/signup`, then confirm the document appears in the Appwrite console under
  Databases → borncinema → profiles.
- Submit a story, approve it as the Editorial Desk, and confirm it goes live.

To roll back to the JSON file, remove the Appwrite variables. Nothing else changes.

### How the switch works

`src/lib/server/db.ts` defines a `Store` interface. Two implementations satisfy it:
`localDb` (the JSON file) and `appwriteDb` (`src/lib/server/db-appwrite.ts`). The export picks
one from `APPWRITE_PROJECT_ID`. The Appwrite client is built lazily, so importing it without
credentials connects to nothing.

Appwrite has no JSON column, so `stats`, `review` and `project` are stored as strings and parsed
on read. Keep that in mind if you add nested fields.

### Note on authentication

Signup and login still use the built-in scrypt hashing and signed cookie, with profiles stored in
Appwrite. Moving to Appwrite Auth would add email verification, password reset and OAuth. It is a
larger change — outlined in [INTEGRATIONS.md](INTEGRATIONS.md) section 2f — and not required.

---

## 2. Image storage: Cloudinary or Cloudflare R2

Story covers currently come from a fixed Unsplash list. To let creators upload their own, pick one.

|  | Cloudinary | Cloudflare R2 |
|---|---|---|
| Resizing, format conversion | Built in, via the URL | None; you serve what you uploaded |
| Free tier | 25 credits/month | 10 GB storage, no egress fees |
| Setup | One signed upload route | S3 client, bucket, public domain |
| Best when | You want `f_auto,q_auto` to do the work | You already use Cloudflare, or store large files |

For this app I would use **Cloudinary**: the covers are displayed at many sizes and its URL
transforms remove a whole class of performance work. R2 is the better choice if you later store
video for the cinematic preview, where egress fees dominate.

### 2a. Cloudinary

1. Sign up at <https://cloudinary.com>. The dashboard shows **Cloud name**, **API key**, **API secret**.
2. Add to `.env.local`:

   ```bash
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   ```

   Only the cloud name is public.

3. `npm install cloudinary`
4. Add `{ protocol: "https", hostname: "res.cloudinary.com" }` to `images.remotePatterns` in
   `next.config.mjs`.
5. Create the signing route and wire the upload button — full code in
   [INTEGRATIONS.md](INTEGRATIONS.md) sections 3c and 3d.

### 2b. Cloudflare R2

1. Cloudflare dashboard → **R2 → Create bucket**, name it `borncinema`.
2. **Manage R2 API Tokens → Create API token**, Object Read & Write. Copy the access key id and
   secret, and note your account id.
3. Give the bucket a public URL: **Settings → Public access → Connect a domain** (or enable the
   `r2.dev` subdomain for testing).
4. Add to `.env.local`:

   ```bash
   R2_ACCOUNT_ID=your-account-id
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret
   R2_BUCKET=borncinema
   NEXT_PUBLIC_R2_PUBLIC_URL=https://media.yourdomain.com
   ```

5. `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
6. Add `{ protocol: "https", hostname: "media.yourdomain.com" }` to `images.remotePatterns`.
7. Create `src/app/api/upload/route.ts` that returns a presigned PUT:

   ```ts
   import { NextResponse } from "next/server";
   import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
   import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
   import { getSession } from "@/lib/server/session";

   export const runtime = "nodejs";

   const s3 = new S3Client({
     region: "auto",
     endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
     credentials: {
       accessKeyId: process.env.R2_ACCESS_KEY_ID!,
       secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
     },
   });

   /** One presigned PUT for the signed-in creator. Members only. */
   export async function POST(req: Request) {
     const me = await getSession();
     if (!me) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

     const { contentType } = await req.json().catch(() => ({ contentType: "image/jpeg" }));
     if (!/^image\/(jpeg|png|webp|avif)$/.test(contentType))
       return NextResponse.json({ error: "unsupported_type" }, { status: 400 });

     const key = `covers/${me.id}/${crypto.randomUUID()}`;
     const url = await getSignedUrl(
       s3,
       new PutObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key, ContentType: contentType }),
       { expiresIn: 60 },
     );

     return NextResponse.json({ url, publicUrl: `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}` });
   }
   ```

8. Upload from the cover picker in `src/app/dashboard/stories/[id]/EditorClient.tsx`:

   ```tsx
   const uploadCover = async (file: File) => {
     setUploading(true);
     try {
       const { url, publicUrl } = await fetch("/api/upload", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ contentType: file.type }),
       }).then((r) => r.json());

       const put = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
       if (put.ok) set("cover", publicUrl);
     } finally {
       setUploading(false);
     }
   };
   ```

   R2 does no resizing, so cap the upload size in the picker (say 5 MB) and, if you want
   transforms later, put Cloudflare Images or a Worker in front of the bucket.

---

## 3. Vercel

`.env.local` is never uploaded. Add the same variables in **Project → Settings → Environment
Variables**, then redeploy. At minimum, for a working deployment:

```
APPWRITE_ENDPOINT
APPWRITE_PROJECT_ID
APPWRITE_API_KEY
APPWRITE_DATABASE_ID
SESSION_SECRET          # a long random string; without it sessions reset on each deploy
OPENAI_API_KEY          # optional; without it the local partner answers
```

Two things to know:

- **Set `SESSION_SECRET`.** It falls back to a built-in default, which means anyone could forge a
  session cookie, and the value changes nothing between deploys only by luck. Generate one with
  `openssl rand -base64 32`.
- **Run `npm run appwrite:setup` once from your machine**, not from the deployment. It needs the
  API key and only has to happen once per environment.

After deploying, confirm with `/api/health` that `backend` is `appwrite` and `persistent` is true.

---

## 4. If something breaks

| Symptom | Cause | Fix |
|---|---|---|
| 500 on every page, `/api/health` 503 | Store cannot read or write | Check `/api/health` `error`; set Appwrite variables or `BC_DATA_DIR` |
| `persistent: false` | Read-only filesystem, memory-only | Connect Appwrite |
| Appwrite errors mentioning scopes | API key missing permissions | Recreate the key with the scopes listed above |
| `Attribute not found in schema` | Schema older than the code | Re-run `npm run appwrite:setup` |
| Signed out after every deploy | `SESSION_SECRET` unset | Set it in Vercel |
| Images 404 after upload | Bucket not public, or wrong `remotePatterns` | Connect a domain in R2, add the host to `next.config.mjs` |
