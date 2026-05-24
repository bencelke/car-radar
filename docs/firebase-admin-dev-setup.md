# Firebase dev admin setup (local only)

The CarRadar **web app** uses the Firebase Web SDK (`.env.local`). Creating an email/password admin user also requires the **Firebase Admin SDK** with a service account — Firestore alone cannot register logins.

## Why Firestore is not enough

| Layer | What it does |
|-------|----------------|
| **Firebase Authentication** | Stores email/password (or OAuth) credentials |
| **Firestore `users/{uid}`** | App profile, `role`, `isAdmin` for `/admin` gate |

Signing in at `/admin` needs **both**: an Auth account and a Firestore doc with `role: "admin"` or `isAdmin: true`. The Admin SDK script creates both.

## 1. Web app config (`.env.local`)

1. Copy `.env.example` → `.env.local` in the project root.
2. Paste your **Firebase Web app** config from Console → Project settings → Your apps.
3. Never commit `.env.local`.

## 2. Service account (Admin SDK, local scripts only)

1. [Firebase Console](https://console.firebase.google.com/) → **Project settings** → **Service accounts**.
2. **Generate new private key** (downloads JSON).
3. Save as:

   ```text
   secrets/firebase-service-account.json
   ```

4. Confirm `secrets/` is in `.gitignore` (it is).
5. **Never commit** this file or push it to GitHub.

Optional:

```env
GOOGLE_APPLICATION_CREDENTIALS=./secrets/firebase-service-account.json
```

Add that line to `.env.local` only if you prefer an explicit path.

## 3. Run scripts

```bash
npm run dev:check-env
npm run dev:create-admin
```

`dev:create-admin` will:

- Refuse to run if `NODE_ENV=production`
- Create or update Auth user `test@test.com` (password `123456`)
- Merge Firestore `users/{uid}` with `role: "admin"`, `isAdmin: true`

## 4. Sign in

1. `npm run dev`
2. Open [http://localhost:3000/admin](http://localhost:3000/admin)
3. Sign in with:
   - Email: `test@test.com`
   - Password: `123456`

## Warnings

- **Dev only** — delete or change this account before production.
- Do not use `123456` or `test@test.com` in production.
- Service account JSON grants full project access — treat like a password.
- Do not add `firebase-admin` or service account paths to the Next.js client bundle (scripts live under `scripts/dev/` only).

## Manual alternative

You can still sign up in the app and promote yourself in Console → Firestore → `users/{your-uid}` → set `role` = `admin` and `isAdmin` = `true`. See [firebase-setup.md](./firebase-setup.md).
