# ShiftIt Vercel Beta Launch Checklist

Use this checklist before deploying ShiftIt / CarRadar to Vercel for online beta (`carradar-bd6fb`).

**Do not commit `.env.local`.** Set all secrets in Vercel project settings only.

---

## 1. Required Vercel environment variables

### Public (client)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web client |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project id (`carradar-bd6fb`) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app id |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Map page tiles / geocoding |

### Server / admin (if used in production)

Add any vars referenced by API routes (check `lib/firebase/admin-server.ts`, notification routes, check-in routes). Do **not** expose service account JSON in client bundles.

---

## 2. Firebase Console checks

- [ ] Project: **carradar-bd6fb**
- [ ] **Authentication → Settings → Authorized domains** includes:
  - `localhost`
  - Vercel preview domain (`*.vercel.app`)
  - Production custom domain (when connected)
- [ ] **Google** (and other) sign-in providers enabled if used
- [ ] **Firestore rules deployed** (includes `profile_claims`, `correction_requests`, claim field protection)
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] **Firestore indexes deployed**
  ```bash
  firebase deploy --only firestore:indexes
  ```
- [ ] **Storage rules deployed** (if avatar/uploads used)
  ```bash
  firebase deploy --only storage
  ```
- [ ] Founder/admin user docs exist in `users/{uid}` with correct `role` / `isAdmin`

---

## 3. Vercel checks

- [ ] GitHub repo connected
- [ ] Production branch selected (e.g. `main`)
- [ ] All env vars added for Production + Preview
- [ ] Build command: `npm run build`
- [ ] Install command: `npm install` (default)
- [ ] Output: Next.js default
- [ ] Custom domain connected when ready

---

## 4. Local pre-deploy checks

```bash
npm run build
npm run firebase:check
```

Optional:

```bash
npm run lint
```

---

## 5. Post-deploy smoke test

### Public discovery

- [ ] `/` — home loads, CTAs work
- [ ] `/map` — Mapbox map renders
- [ ] `/events`, `/clubs`, `/members`, `/shops` — list pages load
- [ ] Club / member / shop / event detail pages load
- [ ] **Community-listed** badge on unclaimed profiles
- [ ] **Claim** CTA routes to `/claim?...` (login redirect when signed out)
- [ ] **Request correction / removal** routes to `/request-correction?...`

### Auth & profile

- [ ] `/login` — sign in works
- [ ] `/profile` — profile loads after login

### Submit & admin

- [ ] `/submit` — test club/member submission creates pending doc
- [ ] `/admin/submissions` — admin can review
- [ ] `/admin/claims` — pending profile claims visible; approve/reject works
- [ ] `/admin/reports` — correction requests visible

### Mobile (360×800, 390×844)

- [ ] Home, map, claim form, correction form usable
- [ ] No horizontal overflow on detail heroes

---

## 6. Beta data seeding (Boris & David)

- [ ] Import clubs + members via `/admin/clubs` (CSV / WBN import)
- [ ] Confirm seeded records: `claimStatus: unclaimed`, `source: admin_seed`, `visibility: public`
- [ ] Add events and shops via admin or submit flow
- [ ] Verify public map shows seeded listings

---

## 7. Security reminders

- Normal users **cannot** approve claims or set `ownerUid` / `claimStatus: claimed` on listings
- Claim ownership assignment requires **admin** Firestore write (client admin panel or future server function)
- Do not store secrets in the repo
- Do not auto-deploy Firebase rules from CI without review

---

## 8. Known beta limitations

- Correction approval does not auto-apply edits to listings yet (admin manual follow-up)
- Some admin claim types (event organizer, club manager) are listed but use profile claim flow for club/member/shop only
- Paid plans, messaging, live GPS, and marketplace are out of scope
