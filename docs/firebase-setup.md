# Firebase setup (CarRadar / ShiftIt)

CarRadar uses the **Firebase Web SDK** in the browser. Server routes may use the **Firebase Admin SDK** with a local service account (gitignored).

## Firebase project

| Setting | Value |
|---------|--------|
| **Project ID** | `carradar-bd6fb` |
| **`.firebaserc` default** | `carradar-bd6fb` |
| **Branding** | ShiftIt (product name; not the Firebase project ID) |

Auth users, Firestore data, and Storage files are **project-specific**. An account or `users/{uid}` document from another Firebase project does not exist in `carradar-bd6fb` until you sign up or create it there.

## 1. Environment variables

Copy `.env.example` to `.env.local` (never commit `.env.local`).

All six `NEXT_PUBLIC_FIREBASE_*` variables are required for Firebase mode. Copy the **complete Web App config** from:

**Firebase Console → carradar-bd6fb → Project settings → General → Your apps**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=carradar-bd6fb.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=carradar-bd6fb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Verify:

```bash
npm run firebase:check
```

**Do not mix** API keys, auth domain, bucket, sender ID, or app ID from different Firebase projects.

Restart the dev server after changing env vars: `npm run dev`.

For testing from another device on the same Wi-Fi, see [lan-development.md](./lan-development.md).

## 2. Firebase Console

In [Firebase Console](https://console.firebase.google.com/) → project **carradar-bd6fb**:

1. **Authentication** → Sign-in method → enable **Email/Password** (and Google/Apple if using social login — see [social-auth-setup.md](./social-auth-setup.md))
2. **Firestore Database** → Create database
3. **Storage** → Enable (for profile/club image uploads)
4. **Authentication** → Settings → **Authorized domains** → add `localhost` and production domains

## 3. Deploy security rules

Repository rules are the source of truth (`firestore.rules`, `firestore.indexes.json`, `storage.rules`).

```bash
npm run firebase:check
firebase login
firebase use carradar-bd6fb
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## 4. First admin user (manual promotion)

Admin emails are **not** hardcoded in the app. Promote users in Firestore only.

1. `npm run dev`
2. Open [`/admin`](http://localhost:3000/admin)
3. **Sign up** or sign in — the account must exist in **carradar-bd6fb** Authentication
4. Firebase Console → **carradar-bd6fb** → **Firestore** → `users` → `{your-auth-uid}`
5. Confirm the document exists (`role: "user"`, `isAdmin: false` on first sign-in)
6. Edit:
   - `role` → `"admin"` (string)
   - `isAdmin` → `true` (boolean)
7. In the app: **Refresh access** on `/admin`, or reload

### users/{uid} shape

```json
{
  "uid": "<exact Firebase Auth UID from carradar-bd6fb>",
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

On sign-in, the app **never** overwrites `role` or `isAdmin` for existing documents.

If you see `permission-denied`, confirm rules are deployed to **carradar-bd6fb** and `npm run firebase:check` passes.

## 5. Development without Firebase

If any required `NEXT_PUBLIC_FIREBASE_*` var is missing:

- App uses mock/local data where implemented
- **`NODE_ENV=development` only:** `/admin` allows a dev bypass (amber warning banner)
- Production builds without Firebase do **not** bypass admin protection

## 6. Security rules (overview)

- Users cannot self-promote to admin
- Public reads expose only approved listings
- Notifications are recipient-scoped
- Submissions are admin-readable

See [firestore-schema.md](./firestore-schema.md) for collection names.

## 7. What not to do

- Do **not** commit `.env.local`, service account JSON, or API keys
- Do **not** target `shiftit-1f973` or any other Firebase project (obsolete wrong ID)
- Do **not** mix Web App config values across projects

## 8. Diagnostics

- CLI: `npm run firebase:check`
- UI: `/admin` → **Firebase diagnostics** (development or when signed in as admin)

No API keys or tokens are shown in diagnostics.

## Clean restart after project fix

```powershell
# Stop dev server (Ctrl+C), then:
Remove-Item -Recurse -Force .next
npm run dev
```

1. Sign out
2. Sign back in (account in **carradar-bd6fb**)
3. Open `/admin`
4. Confirm profile loads and permission errors stop

## Testing checklist

1. `npm run firebase:check` → `overall: OK`
2. `npm run dev`
3. Open `/admin` → sign up / sign in
4. Firestore (**carradar-bd6fb**) → `users` → confirm `{uid}`
5. Set `role: "admin"` and `isAdmin: true`
6. Refresh `/admin` → dashboard unlocks
