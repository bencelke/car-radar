# ShiftIt environment variables

Complete reference for local development and **Cloudflare Pages** production deployment.

**Firebase project:** `carradar-bd6fb`  
**Never commit:** `.env.local`, service account JSON, private keys, or real API secrets.

Copy `.env.example` → `.env.local` for local dev. Validate with:

```bash
npm run firebase:check
npm run dev:check-env
```

---

## Variable reference

| Variable | Required | Side | Used by | Purpose | Cloudflare Pages | Example placeholder |
|----------|----------|------|---------|---------|------------------|---------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | **Yes** | Client (browser) | `lib/firebase/client.ts`, `lib/firebase/env-consistency.ts` | Firebase Web SDK `apiKey` | **Yes** | `your_firebase_api_key_here` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | **Yes** | Client | `lib/firebase/client.ts`, `lib/firebase/project.ts` | Firebase Auth domain | **Yes** | `your_project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | **Yes** | Client + server hint | `lib/firebase/client.ts`, `lib/firebase/admin-server.ts`, `lib/firebase/project.ts` | Firebase project ID | **Yes** | `your_project_id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | **Yes** | Client | `lib/firebase/client.ts`, `lib/firebase/storage.ts` | Avatar / image uploads | **Yes** | `your_project.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | **Yes** | Client | `lib/firebase/client.ts` | Firebase web app sender ID | **Yes** | `your_messaging_sender_id` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | **Yes** | Client | `lib/firebase/client.ts` | Firebase web app ID | **Yes** | `your_firebase_app_id` |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | No* | Client | `lib/map/map-config.ts`, `components/map/CarRadarMap.tsx` | Mapbox GL map tiles | **Yes** | `pk.your_mapbox_public_token` |
| `NEXT_PUBLIC_SITE_URL` | No** | Client | `lib/share/share-url.ts` | Canonical share/invite URLs | **Yes** (production) | `https://your-domain.pages.dev` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | No | — | *(not wired in app code yet)* | Future Firebase Analytics | Optional | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED` | No | Client | `lib/auth/social-provider-availability.ts` | Show/hide Facebook login (`true`/`false`) | Optional | `false` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Dev/scripts only | **Server** (local path) | `lib/firebase/admin-server.ts`, `scripts/dev/*` | Path to Firebase Admin service account JSON | **No** (see blockers) | `/path/to/service-account.json` |
| `FIREBASE_PROJECT_ID` | No | Server/scripts | `scripts/dev/shared-env.mjs` | Fallback project ID for dev scripts | No | `your_project_id` |
| `NODE_ENV` | Auto | Build/runtime | Many files | `development` / `production` | Auto-set by Cloudflare | — |

\* Map works without token but shows fallback UI. Strongly recommended for `/map`.  
\** Falls back to `window.location.origin` in browser; set in production for correct server-rendered share links.

### Public vs secret

| Category | Variables | Notes |
|----------|-----------|-------|
| **Safe in browser** (`NEXT_PUBLIC_*`) | All six Firebase web vars, Mapbox token, site URL, Facebook flag | Embedded in client bundle at build time. Firebase API keys are **not secret** but should be restricted via Firebase Console domain allowlists. |
| **Server-only / never `NEXT_PUBLIC_`** | Service account JSON, `GOOGLE_APPLICATION_CREDENTIALS`, any private key | Admin SDK credentials must never use `NEXT_PUBLIC_` prefix. |
| **Mapbox** | `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Public token by design; restrict by URL in Mapbox dashboard. |

---

## Firebase client SDK (required)

All six values must come from the **same** Firebase Web App config:

**Firebase Console** → `carradar-bd6fb` → Project settings → General → Your apps → Web app → SDK snippet.

Used for:

- Firebase Auth (Google, email, etc.)
- Firestore client reads/writes (security rules enforce access)
- Firebase Storage (avatars, images)

---

## Firebase Admin SDK (server-only)

**Package:** `firebase-admin` (devDependency, used in API routes)

**Module:** `lib/firebase/admin-server.ts`

**Initialization:**

1. `GOOGLE_APPLICATION_CREDENTIALS` → path to JSON file, **or**
2. Local files: `secrets/firebase-service-account.json`, `serviceAccountKey.json`

**Used by API routes** (`export const runtime = "nodejs"`):

| Route | Purpose |
|-------|---------|
| `app/api/notifications/trigger/route.ts` | Server-side notifications |
| `app/api/garage/follow-notify/route.ts` | Garage follow notifications |
| `app/api/events/[eventId]/check-in/*` | Event check-in (open, verify, manual, etc.) |

**Dev scripts only** (never run in production deploy):

- `scripts/dev/create-admin-user.mjs`
- `scripts/dev/seed-founders.mjs`

Do **not** upload service account JSON to Cloudflare as a public asset. For production Admin SDK on serverless, you typically inject JSON via a **secret** env var (not implemented in this repo — see deployment blockers).

---

## Mapbox

**Library:** `mapbox-gl` (client-side only)

**Variable:** `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

**Module:** `lib/map/map-config.ts`

No MapLibre usage in this codebase.

**Production:** Add your Cloudflare Pages domain to Mapbox token URL restrictions.

---

## Analytics

- **Google Analytics / gtag:** not configured
- **Firebase Analytics (`measurementId`):** listed in `.env.example` but **not initialized** in app code
- **Share analytics:** Firestore collection `share_analytics` (in-app, not third-party)

---

## Auth providers

Configured in **Firebase Console** (not env vars):

- Google — enabled via Firebase Auth
- Facebook — optional; gate with `NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED`
- Apple — Firebase Auth provider settings

Add Cloudflare production domain to **Firebase Auth → Authorized domains**.

---

## Cloudflare Pages Variables

Add these in:

**Cloudflare Dashboard** → **Workers & Pages** → **car-radar** → **Settings** → **Environment variables**

Set for **Production** (and **Preview** if you want preview deploys to work with Firebase/Mapbox).

### Required (Production)

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### Strongly recommended

```text
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
NEXT_PUBLIC_SITE_URL=https://your-production-domain.pages.dev
```

### Optional

```text
NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED=false
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Do NOT add to Cloudflare (client-exposed or wrong tool)

| Variable | Reason |
|----------|--------|
| `GOOGLE_APPLICATION_CREDENTIALS` | File path — not available on Cloudflare Pages filesystem |
| Service account JSON content | Use Cloudflare **Secrets** only after Admin SDK env injection is implemented |
| `FIREBASE_PROJECT_ID` (non-public) | Redundant if `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is set |

---

## Cloudflare Pages build settings

| Setting | Value | Notes |
|---------|-------|-------|
| **Project name** | `car-radar` | Matches repo name |
| **Production branch** | `master` | Active branch in this repo (no `main` branch detected) |
| **Root directory** | *(blank)* | Repository root contains `package.json` |
| **Framework preset** | Next.js | Cloudflare may auto-detect |
| **Build command** | `npm run build` | Standard Next.js build |
| **Node.js version** | `20` or `22` | Match local dev (Node 20+ recommended) |
| **Output directory** | See blockers below | Standard `npm run build` outputs `.next/` — **not** a static folder |

### Install command

```bash
npm ci
```

(or `npm install` if `package-lock.json` is present — prefer `npm ci` in CI)

---

## Deployment blockers (Cloudflare)

Read before first deploy:

1. **Node.js API routes + Firebase Admin** — Check-in and notification API routes use `firebase-admin` with `runtime = "nodejs"`. Cloudflare Workers/Pages Edge does **not** run Node.js `firebase-admin` the same way as Vercel. These routes may fail until you:
   - Use an OpenNext/Node-compatible adapter supported by Cloudflare, **or**
   - Move Admin logic to Firebase Cloud Functions / external API, **or**
   - Deploy API-heavy features on a Node host (Vercel, Railway, etc.)

2. **No OpenNext / Wrangler config in repo** — This project has no `wrangler.toml` or `@opennextjs/cloudflare` setup. Default Cloudflare “Next.js” preset may not deploy SSR + API routes correctly without additional configuration.

3. **Service account file paths** — `admin-server.ts` reads JSON from disk. Cloudflare has no persistent local `secrets/` folder at runtime. Production Admin SDK needs a secret env var pattern (future work).

4. **Authorized domains** — Add `*.pages.dev` and your custom domain to Firebase Auth and Mapbox restrictions.

5. **Firestore / Storage rules** — Must be deployed separately (`firebase deploy --only firestore,storage`).

---

## Security checklist

- [ ] `.env.local` is in `.gitignore` (yes)
- [ ] `.env.example` contains placeholders only (yes)
- [ ] No service account JSON in `public/` or git
- [ ] No `NEXT_PUBLIC_` prefix on Admin/private keys
- [ ] Firebase Console API key restricted to your domains
- [ ] Mapbox token URL-restricted

---

## Related docs

- [firebase-setup.md](./firebase-setup.md)
- [firebase-admin-dev-setup.md](./firebase-admin-dev-setup.md)
- [deployment/vercel-beta-launch-checklist.md](./deployment/vercel-beta-launch-checklist.md) — similar checklist (Vercel-oriented)
- [pwa-mobile-readiness.md](./pwa-mobile-readiness.md)

---

## Quick copy: Cloudflare Production env names

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
NEXT_PUBLIC_SITE_URL
```

Optional: `NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED`, `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
