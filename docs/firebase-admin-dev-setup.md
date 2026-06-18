# Firebase dev admin setup (local only)

The CarRadar **web app** uses the Firebase Web SDK (`.env.local`). Creating an email/password admin user also requires the **Firebase Admin SDK** with a service account — Firestore alone cannot register logins.

**Firebase project:** `carradar-bd6fb` — Auth users and Firestore documents from other projects are not visible here.

## Why Firestore is not enough

| Layer | What it does |
|-------|----------------|
| **Firebase Authentication** (`carradar-bd6fb`) | Stores email/password (or OAuth) credentials |
| **Firestore `users/{uid}`** (`carradar-bd6fb`) | App profile, `role`, `isAdmin` for `/admin` gate |

Signing in at `/admin` needs **both** in the **same** Firebase project.

## 1. Web app config (`.env.local`)

1. Copy `.env.example` → `.env.local` in the project root.
2. Paste the **complete Web app** config from Console → **carradar-bd6fb** → Project settings → Your apps.
3. Confirm `NEXT_PUBLIC_FIREBASE_PROJECT_ID=carradar-bd6fb`.
4. Run `npm run firebase:check`.
5. Never commit `.env.local`.

## 2. Service account (Admin SDK, local scripts only)

1. [Firebase Console](https://console.firebase.google.com/) → **carradar-bd6fb** → **Project settings** → **Service accounts**.
2. **Generate new private key** (downloads JSON).
3. Save as:

   ```text
   secrets/firebase-service-account.json
   ```

4. Confirm `secrets/` is in `.gitignore` (it is).
5. **Never commit** this file or push it to GitHub.
6. `npm run firebase:check` reports `service account project matches: yes` when the key belongs to `carradar-bd6fb`.

Optional in `.env.local`:

```env
GOOGLE_APPLICATION_CREDENTIALS=./secrets/firebase-service-account.json
```

## 3. Run scripts

```bash
npm run firebase:check
npm run dev:check-env
npm run dev:create-admin
```

`dev:create-admin` will:

- Refuse to run if `NODE_ENV=production`
- Create or update Auth user `test@test.com` (password `123456`) in **carradar-bd6fb**
- Merge Firestore `users/{uid}` with `role: "admin"`, `isAdmin: true`

## 4. Sign in

1. `npm run dev`
2. Open [http://localhost:3000/admin](http://localhost:3000/admin)
3. Sign in with:
   - Email: `test@test.com`
   - Password: `123456`

## 5. Deploy rules to carradar-bd6fb

```bash
firebase login
firebase use carradar-bd6fb
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Warnings

- **Dev only** — delete or change this account before production.
- Do not use `123456` or `test@test.com` in production.
- Service account JSON grants full project access — treat like a password.
- Do not add `firebase-admin` or service account paths to the Next.js client bundle (scripts live under `scripts/dev/` only).

## Manual alternative

Sign up in the app (against **carradar-bd6fb**) and promote in Console → Firestore → `users/{your-uid}` → `role` = `admin`, `isAdmin` = `true`. See [firebase-setup.md](./firebase-setup.md).
