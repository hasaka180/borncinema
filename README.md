# BORN CINEMA

*Where cinema is born.*

A storytelling and cinema community: take an idea, develop it with a creative partner, publish it as a story, let readers say whether they would watch it, and develop it toward a film.

## Run

```bash
npm install
cp .env.example .env.local   # optional: add OPENAI_API_KEY to use the model
npm run dev
```

Open http://localhost:3000. Become a creator at `/signup` (name, email, password, then a short creative profile: handle, what you make, genres, bio) and sign in at `/login` with email and password. Demo accounts remain available under "Or open a demo account":

| Account | Role | Can |
|---|---|---|
| Mara Voss, Tariq El-Amin | creator | write with the Story Partner, save drafts, submit public stories for review, publish unlisted/private, develop toward cinema |
| Editorial Desk | superadmin | everything above, plus review the queue, approve/reject with notes, feature, unpublish, moderate reports |

Passwords are hashed with scrypt; sessions are signed cookies. Handles are checked live for availability; every creator gets a public profile at `/profile/<handle>` and can edit it in Settings. There is no email verification or password reset yet.

## What is here

- **Landing**: the cinematic tunnel hero (scroll velocity drives the blur; titles stay sharp), then a sticky **How it works** timeline that fills with scroll and draws a hand-drawn character for each stage (idea, develop, write, share, become cinema).
- **Motion**: Lenis smooth scrolling synced with GSAP ScrollTrigger; cinematic blur-in reveals; `prefers-reduced-motion` respected everywhere.
- **Typography**: Zapf Humanist 601 Demi (bundled in `src/fonts/`) for titles, subtitles, labels and buttons, set as spaced caps with grey subtitles in the same face; Cormorant Garamond for prose; Inter for dense interface text. The landing opens with an intro veil (once per session) and a title-card hero: wordmark, a centre mark, and a sentence-style navigation.
- **Five art-directed themes** (Dark, Warm, Cool, Day, Light). The color changes; the cinema does not.
- **Discover**, category pages, and a distraction-free **reader** with paragraph-anchored comments, highlights, fan casting, and the "Would you watch this?" vote that feeds **Screenability** (a community signal, never a prediction).
- **Start an idea / New story**: one question at a time; every suggestion can be used, edited, regenerated, or replaced with your own; "Describe what I'm looking for" refinement; clarification when the idea is vague.
- **Story development**: logline/premise/conflict/arc/ending rewrites, drag-and-drop canvas, version history with compare/restore/branch, the persistent Story Partner.
- **Publishing → editorial review → live**: public stories go to the superadmin queue; approved stories appear in Discover and on their own page; the author watches readers arrive.
- **Dashboard** (`/dashboard`): overview, my stories, editor with AI rewrites, new-story studio, settings; superadmin gets the review queue and moderation.
- **Turn this story into cinema**: an eight-stage film workspace ending in a cinematic preview.

## AI

All writing goes through one contract, `src/lib/ai/types.ts`, and a registry, `src/lib/ai/index.ts`.

- With `OPENAI_API_KEY` set, every interpretation, suggestion, structure, story, rewrite, visual direction, shot list, and partner reply comes from OpenAI through the server route `src/app/api/ai/route.ts` (the key never reaches the browser). Prompts live in `src/lib/ai/prompts.ts`; each op asks for strict JSON.
- Without a key, the local creative partner answers, and the interface says so.
- If a model call fails, that single call falls back to the local partner; the product never breaks.
- Image and video providers remain placeholders behind the same contract.

## Architecture

```
src/lib/ai            provider contracts, prompts, registry
src/lib/ai/providers  openai-text (via /api/ai), mock-text, mock-media
src/lib/server        db (JSON store in .data/), signed sessions, public catalogue
src/app/api           ai, auth, stories, review routes
src/app/dashboard     member and superadmin dashboard
src/lib/data          demo content: 12 stories, 8 authors, 6 film projects, ideas, comments
src/store             creation project state, versions, localStorage persistence
src/middleware.ts     members only under /dashboard
```

The JSON store is a stand-in for a database; every access goes through `src/lib/server/db.ts`.

## Deploying

The prototype defaults to a JSON store in `.data/`, which cannot persist on a read-only
serverless filesystem. For a real deployment connect Appwrite:

```bash
# .env.local
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=...
APPWRITE_API_KEY=...
APPWRITE_DATABASE_ID=borncinema
```

```bash
npm run appwrite:setup   # creates collections, indexes and demo accounts, idempotently
```

`/api/health` reports which backend is live and whether it can persist. Full steps, including
Cloudinary and Cloudflare R2 for image uploads, are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Build without disturbing a running dev server

```bash
NEXT_DIST_DIR=.next-build npm run build
NEXT_DIST_DIR=.next-build npx next start -p 3117
```
