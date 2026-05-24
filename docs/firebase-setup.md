# Firebase setup (CarRadar)

CarRadar uses the **Firebase Web SDK** in the browser only. No service account or Admin SDK in the Next.js app.

## 1. Environment variables

Copy `.env.example` to `.env.local` (never commit `.env.local`).

All six variables are required for Firebase mode:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Restart the dev server after changing env vars: `npm run dev`.

## 2. Firebase Console

In [Firebase Console](https://console.firebase.google.com/):

1. **Authentication** → Sign-in method → enable **Email/Password**
2. **Firestore Database** → Create database (start in test mode for dev, then add production rules)
3. **Storage** → Enable (for profile/club image uploads later)
4. **Authentication** → Settings → **Authorized domains** → add `localhost` and your production domain

## 3. First admin user (manual promotion)

Admin emails are **not** hardcoded in the app. Promote users in Firestore only.

1. `npm run dev`
2. Open [`/admin`](http://localhost:3000/admin)
3. **Open sign in** → **Sign up** with your email and password
4. Firebase Console → **Firestore** → collection `users` → document `{your-uid}`
5. Confirm the document exists with `role: "user"` and `isAdmin: false` (created automatically on first sign-in)
6. Edit the document:
   - `role` → `"admin"` (string)
   - `isAdmin` → `true` (boolean)
7. Back in the app: click **Refresh access** on `/admin`, or reload the page
8. Admin dashboard should unlock

### users/{uid} shape

```json
{
  "uid": "…",
  "email": "you@example.com",
  "role": "admin",
  "isAdmin": true,
  "displayName": null,
  "photoURL": null,
  "createdAt": "…",
  "updatedAt": "…",
  "lastLoginAt": "…"
}
```

On sign-in, the app **never** overwrites `role` or `isAdmin` for existing documents. Profile writes are sanitized (no `undefined` fields — Firestore rejects those).

If you see `permission-denied` on reads, deploy rules: `firebase deploy --only firestore:rules`

## 4. Development without Firebase

If any required `NEXT_PUBLIC_FIREBASE_*` var is missing:

- App uses mock/local data where implemented
- **`NODE_ENV=development` only:** `/admin` allows a dev bypass (amber warning banner)
- Production builds without Firebase do **not** bypass admin protection

## 5. Security rules (overview)

- Clients must not set `role: "admin"` in app code for themselves
- Firestore rules should allow users to read/write their own `users/{uid}` except admin fields
- Admin-only collections (`submissions` review, etc.) should require `isAdmin` or `role == "admin"` in rules

See [firestore-schema.md](./firestore-schema.md) for collection names.

## 6. What not to do

- Do **not** commit `.env.local` or paste API keys into source files
- Do **not** put Firebase **service account** JSON in the frontend repo
- Service account / Admin SDK is for **future server scripts only** (CI, migrations), not the browser app

## 7. Diagnostics

On `/admin`, expand **Firebase diagnostics** (development, or when signed in as admin) to see:

- Firebase / Auth / Firestore / Storage availability
- Current signed-in email
- Admin yes/no

No API keys or tokens are shown.

## Testing checklist

1. `npm run dev`
2. Open `/admin`
3. Sign up with a new email
4. Firestore → `users` → confirm `{uid}` document
5. Set `role: "admin"` and `isAdmin: true`
6. Refresh `/admin` or click **Refresh access**
7. Confirm dashboard opens
