# Social authentication setup (Google & Apple)

ShiftIt uses Firebase Authentication for secure sign-in. Google and Apple are federated providers. Email/password remains supported. Instagram is **profile data only** — not a login provider.

**Firebase project:** `carradar-bd6fb`

`.env.local` must use the **complete Web App config** from this project. If Console shows providers enabled on `carradar-bd6fb` but the app still reports `auth/operation-not-allowed`, run `npm run firebase:check` — a mismatched `.env.local` (for example `shiftit-1f973`) is the most common cause.

## Google

1. Open [Firebase Console](https://console.firebase.google.com/) → project **carradar-bd6fb**
2. **Authentication** → **Sign-in method**
3. Enable **Google**
4. Select a project support email
5. Save

No extra client environment variables are required beyond the existing `NEXT_PUBLIC_FIREBASE_*` web config from **carradar-bd6fb**.

## Apple

Enabling the Apple row in Firebase Console is **not always sufficient** for web sign-in.

### Apple Developer (required for web)

1. Apple Developer membership
2. **Sign in with Apple** capability on your app identifier
3. **Services ID** for the web app
4. Website domain configuration (e.g. `shiftit.club`, Firebase auth domain)
5. Return URL configuration matching Firebase / Apple requirements
6. Apple **Team ID**
7. Apple **Key ID**
8. Apple **private key** (`.p8`) — **never commit**

### Firebase Console (carradar-bd6fb)

1. **Authentication** → **Sign-in method** → **Apple**
2. Enter Service ID, Team ID, Key ID, and private key contents
3. Save

Apple secrets belong in Firebase Console only — not in `NEXT_PUBLIC_*` variables or git.

### Common Apple error codes

| Code | Meaning |
|------|---------|
| `auth/operation-not-allowed` | Provider disabled on the **active** Firebase project, or `.env.local` points at the wrong project |
| `auth/unauthorized-domain` | Current hostname not in Authorized domains |
| `auth/internal-error` | Often incomplete Apple Service ID / key configuration |
| `auth/popup-blocked` | Use redirect sign-in on mobile or after popup block |

Development logs (safe, no tokens): browser console shows `provider`, `code`, `projectId`, `hostname` when Apple/Google fails.

## Authorized domains

**Authentication → Settings → Authorized domains** in **carradar-bd6fb**:

- `localhost`
- Vercel preview / production domains
- `shiftit.club`
- `www.shiftit.club`

If you see `auth/unauthorized-domain`, add the current hostname. The login page and `/admin` diagnostics show the hostname in development.

**LAN IP testing** (`http://192.168.x.x:3000`) is unreliable for OAuth redirects. Prefer:

- `localhost` on the dev machine
- a Vercel preview deployment
- a trusted HTTPS tunnel (future)

## Redirect vs popup (mobile web)

- **Desktop:** `signInWithPopup` where reliable
- **Mobile browsers:** `signInWithRedirect`
- **Popup blocked:** automatic redirect fallback + “Try redirect sign-in”

Before redirect, the destination is stored in `sessionStorage` (`shiftit_auth_next`) and consumed after `getRedirectResult()` runs once.

## Account linking (future)

`auth/account-exists-with-different-credential` means the email already exists with another method. Sign in with the original method first; multi-provider linking from Profile is planned later.

## Instagram

Instagram handle is public profile data only — not a login provider.

## Deploy Firestore rules

Auth success still requires Firestore rules on **carradar-bd6fb**:

```bash
npm run firebase:check
firebase login
firebase use carradar-bd6fb
firebase deploy --only firestore:rules,firestore:indexes,storage
```

## Manual test checklist

1. `npm run firebase:check` → `overall: OK`
2. `/login` — Google and Apple above email form
3. Google sign-in completes against **carradar-bd6fb**
4. Apple sign-in — note exact error code if it fails
5. Email/password still works
6. `users/{uid}` creates without permission errors
7. Notifications return empty list without permission-denied spam
8. Admin account exists in **carradar-bd6fb** Auth + Firestore `users/{uid}`
