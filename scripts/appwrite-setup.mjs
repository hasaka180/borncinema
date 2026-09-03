#!/usr/bin/env node
/**
 * Provisions the Appwrite database for BORN CINEMA, and seeds the demo accounts.
 *
 *   npm run appwrite:setup
 *
 * Idempotent: run it as often as you like. It creates only what is missing, waits for each
 * attribute to become available before building indexes, and never deletes anything.
 */
import { readFileSync } from "node:fs";
import { Client, Databases, ID, Query, DatabasesIndexType } from "node-appwrite";

// --- read .env.local without adding a dependency -----------------------------
try {
  for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
} catch {
  /* fine: variables may come from the shell */
}

const { APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY } = process.env;
const DB = process.env.APPWRITE_DATABASE_ID || "borncinema";
const STORIES = process.env.APPWRITE_STORIES_COLLECTION || "stories";
const PROFILES = process.env.APPWRITE_PROFILES_COLLECTION || "profiles";

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY) {
  console.error(`
Missing credentials. Put these in .env.local, then run again:

  APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
  APPWRITE_PROJECT_ID=<your project id>
  APPWRITE_API_KEY=<a server API key with databases + documents scopes>
  APPWRITE_DATABASE_ID=borncinema
`);
  process.exit(1);
}

const databases = new Databases(
  new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID).setKey(APPWRITE_API_KEY),
);

const ok = (m) => console.log(`  + ${m}`);
const skip = (m) => console.log(`  . ${m}`);
const exists = (e) => e?.code === 409;

// --- schema ------------------------------------------------------------------
const S = (key, size, required = false, array = false) => ({ kind: "string", key, size, required, array });
const E = (key, elements, required = false) => ({ kind: "enum", key, elements, required });
const B = (key) => ({ kind: "boolean", key, required: false });

const SCHEMA = {
  [PROFILES]: {
    name: "Profiles",
    attributes: [
      S("handle", 64, true),
      S("name", 120, true),
      E("role", ["creator", "superadmin"], true),
      S("email", 255),
      S("passwordHash", 255),
      S("bio", 500),
      S("location", 120),
      S("makes", 60, false, true),
      S("genres", 40, false, true),
    ],
    indexes: [
      { key: "handle_unique", type: DatabasesIndexType.Unique, attributes: ["handle"] },
      { key: "email_idx", type: DatabasesIndexType.Key, attributes: ["email"] },
    ],
  },
  [STORIES]: {
    name: "Stories",
    attributes: [
      S("slug", 255, true),
      S("title", 255, true),
      S("authorId", 64, true),
      S("authorName", 120),
      S("authorHandle", 64),
      S("cover", 600),
      S("hook", 600),
      S("synopsis", 2000),
      S("genre", 40),
      S("format", 40),
      S("language", 40),
      S("rating", 20),
      S("tags", 40, false, true),
      E("visibility", ["public", "unlisted", "private"], true),
      E("status", ["draft", "submitted", "published", "rejected"], true),
      B("allowRemixes"),
      B("featured"),
      S("paragraphs", 65535, false, true),
      S("submittedAt", 40),
      S("publishedAt", 40),
      S("review", 4000),
      S("project", 100000),
      S("stats", 1000),
    ],
    indexes: [
      { key: "slug_unique", type: DatabasesIndexType.Unique, attributes: ["slug"] },
      { key: "author_idx", type: DatabasesIndexType.Key, attributes: ["authorId"] },
      { key: "status_idx", type: DatabasesIndexType.Key, attributes: ["status"] },
    ],
  },
};

const DEMO = [
  { handle: "editorial", name: "Editorial Desk", role: "superadmin", bio: "Reads every story before it goes public." },
  { handle: "maravoss", name: "Mara Voss", role: "creator", bio: "I write about the hours nobody is awake for." },
  { handle: "tariqel", name: "Tariq El-Amin", role: "creator", bio: "Cities that pretend to be finished." },
];

// --- helpers -----------------------------------------------------------------
async function ensureDatabase() {
  try {
    await databases.get({ databaseId: DB });
    skip(`database "${DB}" already exists`);
  } catch {
    await databases.create({ databaseId: DB, name: "Born Cinema" });
    ok(`database "${DB}" created`);
  }
}

async function ensureCollection(id, name) {
  try {
    await databases.getCollection({ databaseId: DB, collectionId: id });
    skip(`collection "${id}" already exists`);
  } catch {
    await databases.createCollection({
      databaseId: DB,
      collectionId: id,
      name,
      permissions: [],
      documentSecurity: false,
      enabled: true,
    });
    ok(`collection "${id}" created`);
  }
}

async function ensureAttribute(collectionId, a) {
  const base = { databaseId: DB, collectionId, key: a.key, required: a.required, array: a.array || false };
  try {
    if (a.kind === "string") await databases.createStringAttribute({ ...base, size: a.size });
    else if (a.kind === "enum") await databases.createEnumAttribute({ ...base, elements: a.elements });
    else await databases.createBooleanAttribute(base);
    ok(`${collectionId}.${a.key}`);
  } catch (e) {
    if (exists(e)) skip(`${collectionId}.${a.key} already exists`);
    else throw new Error(`${collectionId}.${a.key}: ${e.message}`);
  }
}

/** Attributes are built asynchronously; indexes fail until every column is available. */
async function waitForAttributes(collectionId, keys) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const list = await databases.listAttributes({ databaseId: DB, collectionId });
    const byKey = new Map(list.attributes.map((x) => [x.key, x.status]));
    const failed = keys.filter((k) => byKey.get(k) === "failed");
    if (failed.length) throw new Error(`attributes failed to build: ${failed.join(", ")}`);
    if (keys.every((k) => byKey.get(k) === "available")) return;
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`timed out waiting for attributes on ${collectionId}`);
}

async function ensureIndex(collectionId, idx) {
  try {
    await databases.createIndex({
      databaseId: DB,
      collectionId,
      key: idx.key,
      type: idx.type,
      attributes: idx.attributes,
      orders: idx.attributes.map(() => "ASC"),
    });
    ok(`index ${collectionId}.${idx.key}`);
  } catch (e) {
    if (exists(e)) skip(`index ${collectionId}.${idx.key} already exists`);
    else throw new Error(`index ${collectionId}.${idx.key}: ${e.message}`);
  }
}

async function seedDemoUsers() {
  for (const u of DEMO) {
    const found = await databases.listDocuments({
      databaseId: DB,
      collectionId: PROFILES,
      queries: [Query.equal("handle", u.handle), Query.limit(1)],
    });
    if (found.documents.length) {
      skip(`@${u.handle} already seeded`);
      continue;
    }
    await databases.createDocument({ databaseId: DB, collectionId: PROFILES, documentId: ID.unique(), data: u });
    ok(`seeded @${u.handle} (${u.role})`);
  }
}

// --- run ---------------------------------------------------------------------
console.log(`
Born Cinema -> Appwrite
  endpoint ${APPWRITE_ENDPOINT}
  project  ${APPWRITE_PROJECT_ID}
  database ${DB}
`);

try {
  console.log("Database");
  await ensureDatabase();

  for (const [id, def] of Object.entries(SCHEMA)) {
    console.log(`\nCollection "${id}"`);
    await ensureCollection(id, def.name);
    for (const a of def.attributes) await ensureAttribute(id, a);
    process.stdout.write("  waiting for columns to build... ");
    await waitForAttributes(id, def.attributes.map((a) => a.key));
    console.log("ready");
    for (const idx of def.indexes) await ensureIndex(id, idx);
  }

  console.log("\nDemo accounts");
  await seedDemoUsers();

  console.log(`
Done. Start the app and it will use Appwrite:
  npm run dev
`);
} catch (e) {
  console.error(`\nSetup failed: ${e.message}\n`);
  if (/missing scope|unauthorized|401/i.test(e.message)) {
    console.error("The API key needs the databases and documents scopes (read and write).\n");
  }
  process.exit(1);
}
