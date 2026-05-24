# Firebase data import (clubs & members)

CarRadar uses **Firestore** as the source of truth for public clubs and member profiles when Firebase is configured. Local JSON seeds (e.g. WBN) remain a **fallback** when Firestore is empty or unavailable.

## Collections

| Collection | Document ID | Purpose |
|------------|-------------|---------|
| `users` | Firebase Auth `uid` | App accounts (admin promotion) |
| `clubs` | Club slug/id (e.g. `wbn`) | Public car clubs |
| `club_members` | `{clubId}-{handle-slug}` | Public member/garage profiles |

Member profiles do **not** require a Firebase Auth account. Claim fields are stored for a future flow:

- `claimStatus`: `unclaimed` | `pending` | `claimed` | `rejected`
- `claimedByUid`: `null` or Firebase `uid` after approval

## Admin: CSV / Google Sheets → Firestore

1. Sign in as **admin** on `/admin`.
2. **Club import** tab → club details + CSV (paste, upload, or Sheets link).
3. **Preview members**.
4. **Import to Firestore** — writes `clubs/{clubId}` and `club_members/{memberId}`.
5. Status is `approved`; `claimStatus` is `unclaimed`.

Images are **not** uploaded. Paths default to:

```text
/data/clubs/{clubId}/images/{memberId}.webp
```

Optimize images locally or upload to Firebase Storage later and update `imageUrl` / `avatarUrl` in Firestore.

## Admin: WBN seed → Firestore

**Firestore data** tab → **Import WBN local seed**

- Writes `clubs/wbn` from bundled `public/data/clubs/wbn/wbn.json`.
- Writes all WBN `club_members/*` documents.
- Does not upload binaries.

## Admin: manual add

**Firestore data** tab:

- **Add club manually** — minimal fields → `clubs/{clubId}`
- **Add member manually** — clubId, Instagram handle, car, location → `club_members/{memberId}`

## Local fallback

Repositories merge Firestore + mock/published data:

- Firestore document **wins** for the same `id`.
- If Firestore has no rows, WBN and other seeds still appear from `lib/mock-data/seeds.ts`.

Removing Firebase env vars restores mock-only mode (dev admin bypass on `/admin` in development only).

## Security

- Only **admins** can create/update `clubs` and `club_members` (see `firestore.rules`).
- Clients cannot set `role` / `isAdmin` on their own `users` doc.
- **No** service account keys in the frontend.
- Deploy rules: `firebase deploy --only firestore:rules,storage`

## Future: profile claiming

1. User signs in.
2. User searches by Instagram handle.
3. User requests claim → `claimStatus: pending`.
4. Admin verifies (manual / Instagram code).
5. Admin sets `claimedByUid` and `claimStatus: claimed`.
6. User can edit allowed profile fields and photos.

Not implemented in the app UI yet.

## Future: Storage migration

Replace local paths with HTTPS URLs from Firebase Storage:

- `club-images/{clubId}/cover.webp`
- `profile-images/member/{memberId}/profile.webp`

Firestore stores URLs only — never image binary.
