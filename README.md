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
- **Day 12:** Public detail pages (`/shops/[slug]`, `/events/[slug]`, `/clubs/[slug]`, `/members/[id]`, `/cities/[city]`) with SEO metadata and shareable links from list cards and the map
- **Not yet:** Correction auto-apply, live GPS, chat, or marketplace

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` to `.env.local` and add Firebase or Mapbox keys when you connect those services. The app runs without them using mock data.

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

1. Create a Firebase project and enable **Email/Password** authentication.
2. Add all `NEXT_PUBLIC_FIREBASE_*` variables to `.env.local` (see `.env.example`).
3. Run the app, open `/admin`, and **Sign up** / **Sign in** with your email.
4. In [Firebase Console](https://console.firebase.google.com) → **Firestore** → collection `users` → document `{your-uid}`:
   - Set `role` to `admin`
   - Set `isAdmin` to `true`
5. Refresh `/admin` — the review and CSV import dashboard should load.

Do not hardcode admin emails in the codebase. Use Firestore for role assignment.

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

## Project structure

```
app/              # Routes (dashboard, map, events, shops, communities, submit, admin)
components/       # UI (dashboard panels, layout, submit form)
lib/
  config/         # Brand and theme config
  data/           # Dashboard data loaders
  firebase/       # Optional Firebase client
  mock-data/      # Seed data for mock mode
  repositories/   # Data access (Firestore + mock fallback)
  types/          # Domain and UI types
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
