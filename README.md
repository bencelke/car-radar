# CarRadar

CarRadar is a web-first car enthusiast discovery platform. It helps users find car communities, upcoming meets and events, tuning and mod shops, wrap and tint shops, detailers, wheel specialists, club areas, and Instagram links near them.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
- [shadcn/ui](https://ui.shadcn.com)
- Firebase client (optional — mock data fallback when not configured)

## Current status

- **Day 1:** Premium dark dashboard UI prototype with mock map and discovery panels
- **Day 2:** Typed domain models, repository layer, seed data, and Firestore-ready structure (mock mode by default)
- **Day 5:** Mapbox map on `/` and `/map` with shared markers and filters
- **Day 6:** Firestore-ready submit flow at `/submit` (shops, events, clubs, members, corrections)
- **Day 7:** Admin submission review at `/admin` (approve, reject, needs changes)
- **Day 8:** Approving shop/event/club/member submissions publishes to public listings (`car_shops`, `car_events`, `clubs`, `club_members`)
- **Day 9:** Admin edit-before-publish + non-blocking duplicate warnings on `/admin`
- **Day 10:** Admin CSV import → pending submissions (no auto-publish)
- **Day 11:** Admin route protection (Firebase Auth + `users` role) and `firestore.rules` foundation
- **Day 12:** Public detail pages + member profiles with map hover previews, role badges, and `/members/[id]` garage-style profile pages
- **Not yet:** Correction auto-apply, live GPS, chat, or marketplace

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### ShiftIt brand assets

User-facing branding uses **ShiftIt** / **ShiftIt.club** (`lib/config/brand.ts`). Internal package and repo name remain **CarRadar**.

| Asset | Path |
|-------|------|
| Source (design) | `Logo/shiftit-dark.png` |
| PNG (fallback) | `public/brand/shiftit-dark.png` |
| Hero WebP (~1100px) | `public/brand/shiftit-logo.webp` |
| Nav WebP (~220px) | `public/brand/shiftit-logo-small.webp` |

Regenerate WebP after updating the source PNG:

```bash
npm run dev:optimize-brand
```

Replace with a final vector/SVG logo when available. Login: `/login` (email/password via Firebase Auth).

### Local environment setup

1. In the project root, create **`.env.local`** (it is not in git — see `.gitignore`).
2. Copy the variable names from **`.env.example`** into `.env.local`.
3. In [Firebase Console](https://console.firebase.google.com/) → your project → **Project settings** → **Your apps** → Web app → copy the **Firebase SDK** config values into the matching `NEXT_PUBLIC_FIREBASE_*` keys (do not paste config into source files).
4. Optional: add a [Mapbox](https://account.mapbox.com/) access token as `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` for `/map`.
5. **Restart** the dev server after any env change: stop `npm run dev`, then run it again.

**Never commit `.env.local`.** Only `.env.example` (empty placeholders) belongs in the repo.

| Variable | Required for Firebase mode |
|----------|---------------------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | No (map fallback without it) |

If any required Firebase variable is missing or empty, `lib/firebase/client.ts` skips initialization and the app keeps using mock/local fallbacks. See [docs/firebase-setup.md](docs/firebase-setup.md) for Auth, Firestore, and first admin steps.

### Dev admin test user (Admin SDK script)

Firestore cannot create email/password logins. For local development, use a **service account** and:

```bash
npm run dev:check-env
npm run dev:create-admin
```

Save the service account JSON as `secrets/firebase-service-account.json` (gitignored). Full steps: [docs/firebase-admin-dev-setup.md](docs/firebase-admin-dev-setup.md).

Default dev login: `test@test.com` / `123456` — **change or delete before production.**

### Submit flow (`/submit`)

Users can submit shops, events, clubs, member builds, and corrections for **review** (nothing is auto-published).

- **With Firebase:** All six `NEXT_PUBLIC_FIREBASE_*` variables must be set. Submissions are written to the Firestore collection `submissions` with `status: "pending"`.
- **Without Firebase:** The UI still succeeds; `createSubmission` logs `[CarRadar] Firebase not configured. Simulating submission.` and stores entries in the in-memory mock submission store (visible on `/admin` in dev).
- **Auth:** Login is not required to submit. Signed-in users automatically attach `submittedByUid` / email when Firebase Auth is configured.
- **Homepage:** The submit preview card links to `/submit` instead of embedding the full form.

In development, if Firebase is not configured, `/submit` shows a small note that submissions are simulated.

### Admin review (`/admin`)

`/admin` is protected when Firebase is configured: sign in required, then **admin** role on your `users/{uid}` document. Without Firebase env vars, admin UI stays available in **development mode** with a visible warning (mock review + CSV import still work).

1. **Mock mode:** No Firebase env → open `/admin` directly (dev warning shown). Review, CSV import, and approve use mock stores as before.
2. **Firebase mode:** Sign in at `/admin` → access denied until you are promoted to admin (see below).

### First admin setup (Firebase)

Full guide: [docs/firebase-setup.md](docs/firebase-setup.md)

1. Add all six `NEXT_PUBLIC_FIREBASE_*` variables to `.env.local` (copy from `.env.example` — **never commit** `.env.local`).
2. Firebase Console → enable **Authentication → Email/Password** and create **Firestore**.
3. `npm run dev` → open `/admin` → **Sign up** with your email.
4. Firestore → `users` → `{your-uid}` — confirm auto-created doc (`role: "user"`, `isAdmin: false`).
5. Set `role` = `"admin"` and `isAdmin` = `true` in the Console (manual promotion only).
6. Click **Refresh access** on `/admin` or reload — dashboard unlocks.

Do not hardcode admin emails in code. Do not put service account keys in the frontend.

### Deploy Firestore security rules

Rules live in `firestore.rules`. `firebase.json` points Firestore to that file.

When you have the [Firebase CLI](https://firebase.google.com/docs/cli) installed and the project linked:

```bash
firebase deploy --only firestore:rules
```

Until rules are deployed, rely on Console rules appropriate for your environment. **Production:** only admins should reach `/admin`; public users must not bulk-import or publish listings.

### Publish on approve (Day 8)

Approving a **shop**, **event**, **club**, or **member** submission creates a public listing and links it via `approvedEntityId`. **Corrections** are approved for review only (not applied to listings yet).

**Mock mode test:**

1. Without Firebase env, submit a shop at `/submit`.
2. Open `/admin` → Pending → Approve.
3. Detail should show `approvedEntityId` and `publishedCollection: shops`.
4. Open `/map` or `/shops` — the new shop should appear (merged from in-memory published store for the dev session).

**Firebase mode test:**

1. Submit and approve as above.
2. In Firebase Console, verify the new document in `car_shops` (or matching collection) and updated `submissions` row.

### Edit before publish + duplicates (Day 9)

1. Submit a shop with messy name/description at `/submit`.
2. Open `/admin` → Pending → select the row.
3. Use **Edit publish details** — fix name, city, description, tags, coordinates.
4. Approve → published listing should use **edited** values (check `/shops` or `/map`).
5. Submit another shop with the **same name and city** as an existing listing.
6. Before approve, confirm the orange **Possible duplicate** panel appears (non-blocking; you can still approve).

### CSV import (Day 10)

Admin-only bulk import at `/admin` → **CSV import** tab. Rows become **pending** submissions (not auto-published). In production, only admins should access this.

**Mock mode:**

1. Open `/admin` → CSV import.
2. Download sample CSV or paste from `public/samples/car-radar-import-sample.csv`.
3. **Preview import** → check valid / warning / error rows.
4. **Import valid rows** → switch to Review tab (or refresh) → pending queue should include imported rows.

**Firebase mode:**

1. Import sample CSV.
2. Firestore → `submissions` → new docs with `status: pending`, `importSource: csv`.
3. Review one submission → edit if needed → approve → publishes via Day 8 flow.

**Security reminder:** Do not expose CSV import to public users in production.

### Other commands

```bash
npm run build   # production build
npm run start   # run production build locally
npm run lint    # ESLint
```

### Member profiles & map cards (Day 12)

- Hover a **member** marker on `/` or `/map` for a compact preview (name, car, club, role badge, Instagram link).
- Click a member marker for a richer side panel with build summary, tags, **Follow** placeholder, and **View full profile**.
- Full profile at `/members/[id]` (e.g. `/members/member-boris`) — car build card layout, club affiliation, social links, correction CTA.
- Club pages show role badges (Founder, Road Captain, Club Admin, etc.) on member cards.
- Instagram is an **external link only** — no scraping, avatars, or follower counts.

### Public detail pages (Day 12)

Shareable, SEO-friendly pages for discovery via Google, Instagram DMs, and direct links:

| Route | Example |
|-------|---------|
| `/shops/[slug]` | `/shops/kmc-performance` |
| `/events/[slug]` | `/events/cars-and-coffee-kaiserslautern` |
| `/clubs/[slug]` | `/clubs/bavarian-crew` |
| `/members/[id]` | `/members/member-boris` |
| `/cities/[city]` | `/cities/kaiserslautern` |

- Slugs prefer an optional `slug` field on shops/events; otherwise `lib/utils/slug.ts` derives a slug from the name/title or falls back to the document id.
- Each page exports `generateMetadata` for title/description templates.
- List cards on `/shops`, `/events`, `/clubs`, `/members` and the map detail panel link to these routes.
- City pages aggregate approved shops, clubs, events, members, and community zones for local SEO.

## Profile image upload

Signed-in users can upload a profile photo at [`/profile`](http://localhost:3000/profile). Images are **optimized in the browser** before upload (not sent raw).

| Requirement | Details |
|-------------|---------|
| Firebase Auth | All six `NEXT_PUBLIC_FIREBASE_*` vars |
| Firebase Storage | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` must be set |
| Storage path | `profile-images/{user\|member}/{id}/profile.webp` |
| Firestore | `avatarUrl`, `imageUrl`, `imageStoragePath`, `imageUpdatedAt`, `imageSizeBytes`, `imageContentType` only — **no base64** |

**Test:** sign in → `/profile` → select a ~1.6 MB JPEG → **Optimize & Upload** → confirm smaller size + progress → refresh → image shows.

Admins can upload member car photos on member detail pages (`EditableMemberImagePanel`).

**Local member image save (dev only):**

1. `npm run dev` → open `/members/wbn-bambam-84`
2. Use **Local image optimizer** → select a large JPEG → **Save optimized image locally**
3. File is written to `public/data/clubs/wbn/images/wbn-bambam-84.webp`
4. `npm run check:wbn-images` → refresh `/clubs/wbn` or the member page

Works only in development. Production uses Firebase Storage (see `docs/image-optimization.md`).

**Club cover image (dev):**

1. `npm run dev`
2. Open `/clubs/wbn`
3. Expand **Club admin tools** (sidebar)
4. Upload a cover JPEG → **Save cover locally**
5. Confirm `public/data/clubs/wbn/cover.webp` exists
6. Refresh `/clubs/wbn` and `/clubs` (WBN card uses cover when present)

Club text edits persist only when Firebase is configured and you are admin; otherwise edit `public/data/clubs/wbn/wbn.json`.

**Manual member photo test (admin, Firebase configured):**

1. Configure Firebase Auth + Firestore + Storage.
2. Promote your user to admin in `users/{uid}`.
3. `npm run dev` → sign in → open `/members/wbn-masy-m4`.
4. Select a ~1.6 MB JPEG in **Admin image upload** → **Optimize & Upload**.
5. Confirm Storage: `profile-images/member/wbn-masy-m4/profile.webp`
6. Confirm Firestore: `club_members/wbn-masy-m4` with `imageUrl` / `avatarUrl` only (no binary).
7. Image updates immediately on the profile; refresh `/clubs/wbn` to see the card photo.

See [docs/image-optimization.md](docs/image-optimization.md).

## Google Sheets club member export

For clubs with many members, use the **Google Apps Script** exporter (bulk rows + car photos from the Photo column):

- Script (copy into Sheets): [`scripts/google-sheets/export-club-members-appscript.js`](scripts/google-sheets/export-club-members-appscript.js)
- Guide: [`docs/google-sheets-club-export.md`](docs/google-sheets-club-export.md)

Sheet columns: **Instagram · Car Model · Photo · Location**. Exports JSON/CSV and images to Drive under `CarRadar Exports/{clubId}/`. Imported images should still be optimized (WebP, ≤100 KB) before production — see [`scripts/optimize-images/README.md`](scripts/optimize-images/README.md).

This script is **not** part of the Next.js build; it runs only inside Google Sheets.

## Admin club import wizard

**Admin → Club import** builds a club + members from CSV (upload, paste, or public Google Sheets CSV export URL).

1. `npm run dev` → `/admin` → **Club import**
2. Enter club details (ID, name, city, country, …)
3. Paste or upload CSV with columns: `Instagram`, `Car Model`, `Photo`, `Location`
4. **Preview members** → **Download club JSON** and/or **Save club JSON locally** (dev)
5. Optional: **Import into local session** — visible on `/clubs` and `/members` until dev server restart

| Output | Path |
|--------|------|
| Club JSON | `public/data/clubs/{clubId}/{clubId}.json` |
| Member images (later) | `public/data/clubs/{clubId}/images/{memberId}.webp` |
| Club cover (later) | `public/data/clubs/{clubId}/cover.webp` |

**Embedded Sheet images** do not export via CSV — use the [Apps Script exporter](docs/google-sheets-club-export.md) or upload photos per member on the club/member admin tools.

Guide: [docs/club-json-import.md](docs/club-json-import.md)

## Firestore clubs & members

When Firebase is configured, **Firestore is the source of truth** for `clubs` and `club_members`. Local WBN JSON remains a fallback when Firestore is empty.

| Action | Where |
|--------|--------|
| CSV/Sheets → Firestore | `/admin` → **Club import** → Preview → **Import to Firestore** |
| WBN seed → Firestore | `/admin` → **Firestore data** → **Import WBN local seed** |
| Manual club/member | `/admin` → **Firestore data** |

- Image fields store **URLs/paths only** (no binary in Firestore).
- Members are **claim-ready** (`claimStatus: unclaimed`) — claiming flow is future work.
- Deploy rules: `firebase deploy --only firestore:rules,storage`

Docs: [docs/firebase-data-import.md](docs/firebase-data-import.md) · [docs/firestore-schema.md](docs/firestore-schema.md)

## Real club seed data (WBN)

Local JSON seeds real club and member profiles from a Google Sheet (columns: Instagram, Car Model, Photo, Location). No Instagram scraping.

| Item | Path |
|------|------|
| Source JSON | `public/data/clubs/wbn/wbn.json` |
| Loader | `lib/mock-data/clubs/wbn.ts` → `lib/mock-data/seeds.ts` |
| Member photos | `public/data/clubs/wbn/images/` |

### WBN image file names

Place one optimized photo per member in `public/data/clubs/wbn/images/`:

- `wbn-bambam-84.webp`
- `wbn-die-bimmerboys.webp`
- `wbn-pecke-r56.webp`
- `wbn-her-rallyeredfk8.webp`
- `wbn-larissa-s5.webp`
- `wbn-masy-m4.webp`
- `wbn-pod-racer.webp`
- `wbn-smoked-m4.webp`
- `wbn-stefan-m346.webp`
- `wbn-ugurcan-m4.webp`
- `wbn-unbegrenzt335.webp`

Guidelines:

- **≤ 100 KB** per file, **`.webp`** preferred (see `docs/image-optimization.md`)
- JSON stores only paths (`imageUrl` / `avatarUrl`), e.g. `/data/clubs/wbn/images/wbn-masy-m4.webp`
- **Do not** store image binaries in Firestore
- Missing files are OK in dev — UI uses a gradient fallback

Check which files exist (lists found/missing filenames and % complete):

```bash
npm run check:wbn-images
```

Image folder readme: `public/data/clubs/wbn/images/README.md`

### WBN member fields

Each row uses the Instagram column as `instagramHandle` (no `@`), `displayName` as `@handle`, and `instagram` as `https://instagram.com/{handle}`. Car model text is stored in `carName` with parsed `carMake` / `carModel`.

Routes: `/clubs/wbn`, `/members`, `/members/wbn-masy-m4`, `/map` (pan to Wiesbaden or search **WBN** / **Wiesbaden**).

## Project structure

```
app/              # Routes (dashboard, map, events, shops, communities, submit, admin)
components/       # UI (dashboard panels, layout, submit form)
lib/
  config/         # Brand and theme config
  data/           # Dashboard data loaders
  firebase/       # Optional Firebase client
  mock-data/      # Seed data for mock mode (includes clubs/wbn loader)
  repositories/   # Data access (Firestore + mock fallback)
  types/          # Domain and UI types
public/data/      # Local club JSON + image paths (WBN)
docs/             # Firestore schema notes
scripts/          # Seed script placeholder
```

## Environment variables

See `.env.example` for optional variables:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web app (with the other five `NEXT_PUBLIC_FIREBASE_*` vars) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Interactive Mapbox map |

If any Firebase variable is missing, the client skips initialization and repositories use mock fallbacks. Do not commit `.env.local` or other secret files.

## License

Private project — all rights reserved unless otherwise specified.
