# Founder & admin setup

ShiftIt founders are stored in Firestore `users/{uid}` — not hardcoded in UI.

## Founder UIDs (seed reference only)

| User | UID | Title |
|------|-----|-------|
| Boris | `l3LCkOap3LOEgUqDKlIJ7GogG442` | Founder |
| David | `UZApYWbHw8UjK5DPYxfMczAxoUH2` | Co-Founder |

## Automated seed (Admin SDK)

1. Save service account JSON to `secrets/firebase-service-account.json` (gitignored).
2. Ensure `.env.local` targets `carradar-bd6fb`.
3. Run:

```bash
npm run seed:founders
```

This merges founder fields without wiping email, displayName, or photoURL.

## Manual Firestore fallback

Firebase Console → Firestore → `users/{uid}` → merge:

**Boris** — `users/l3LCkOap3LOEgUqDKlIJ7GogG442`

```json
{
  "uid": "l3LCkOap3LOEgUqDKlIJ7GogG442",
  "role": "founder",
  "isAdmin": true,
  "adminRole": "founder",
  "title": "Founder"
}
```

**David** — `users/UZApYWbHw8UjK5DPYxfMczAxoUH2`

```json
{
  "uid": "UZApYWbHw8UjK5DPYxfMczAxoUH2",
  "role": "founder",
  "isAdmin": true,
  "adminRole": "founder",
  "title": "Co-Founder"
}
```

After updating, sign out/in or click **Refresh access** on `/admin`.

## Security

- Clients cannot set `role`, `isAdmin`, `adminRole`, or `title` on create (see `firestore.rules`).
- `/admin` is gated by Firestore profile fields via `isAdminUser()`.
- Deploy updated rules when ready: `firebase deploy --only firestore:rules`
