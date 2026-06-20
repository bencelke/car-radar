# Social authentication setup (Google, Apple & Facebook)

ShiftIt uses Firebase Authentication for secure sign-in. Google, Apple, and Facebook are federated providers. Email/password remains supported. Instagram is **profile data only** — not a login provider.

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

## Facebook

### Meta Developer app

1. Create a [Meta developer app](https://developers.facebook.com/)
2. Add the **Facebook Login** product
3. Obtain **App ID** and **App Secret**
4. Keep **App Secret** server-side / Firebase Console only — **never** add to `NEXT_PUBLIC_*`

### Firebase Console (carradar-bd6fb)

1. **Authentication** → **Sign-in method** → **Facebook**
2. Enable Facebook
3. Enter **App ID** and **App Secret**
4. Copy the Firebase OAuth redirect URI shown in Console

### Meta app settings

1. **Facebook Login** → **Settings**
2. Add the Firebase OAuth redirect URI to **Valid OAuth Redirect URIs**
3. Add production domains to **App Domains** and **Site URL** as required:
   - `shiftit.club`
   - `www.shiftit.club`
   - Your Vercel deployment domain
4. Meta may require **business verification** or **app review** for public permissions and production access
5. While the Meta app is in **Development** mode, add **Test Users** for QA

### Client availability flag

Production builds hide the Facebook button unless explicitly enabled:

```env
NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED=true
```

In local development the button is visible by default so you can test setup errors. Set `NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED=false` to hide it locally.

ShiftIt requests **basic public profile** and **email** (when available) only. No friends list, pages, Instagram, ads, publishing, or business permissions.

## Authorized domains

**Authentication → Settings → Authorized domains** in **carradar-bd6fb**:

- `localhost`
- Vercel preview / production domains
- `shiftit.club`
- `www.shiftit.club`

If you see `auth/unauthorized-domain`, add the current hostname.

**LAN IP testing** (`http://192.168.x.x:3000`) is unreliable for OAuth redirects. Prefer:

- `localhost` on the dev machine
- a Vercel preview deployment
- a trusted HTTPS domain

## Redirect vs popup (mobile web)

- **Desktop:** `signInWithPopup` where reliable
- **Mobile browsers:** `signInWithRedirect`
- **Popup blocked:** automatic redirect fallback + “Try redirect sign-in”

Before redirect, the destination is stored in `sessionStorage` (`shiftit_auth_next`) and consumed after `getRedirectResult()` runs once.

## Account collision

`auth/account-exists-with-different-credential` means the email already exists with another method. Sign in with the original method first; multi-provider linking from Profile is planned later.

## Instagram

Instagram handle is public profile data only — not a login provider. Users add it from Profile after sign-in.

## Guest browsing

“Continue as Guest” does **not** create a Firebase anonymous user or Firestore profile. Guests may browse public routes only (map, clubs, events, members, shops). Protected actions redirect to `/login`.

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
2. `/login` — Google, Apple, Facebook (when enabled), email, and guest
3. Google sign-in completes against **carradar-bd6fb**
4. Apple sign-in — note exact error code if it fails
5. Facebook sign-in after Meta + Firebase configuration
6. Email/password still works
7. Forgot password sends reset email
8. Guest routes to public `next` or `/`
9. `users/{uid}` creates without permission errors
10. Admin account exists in **carradar-bd6fb** Auth + Firestore `users/{uid}`
