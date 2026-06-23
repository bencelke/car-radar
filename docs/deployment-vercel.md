# ShiftIt on Vercel

Deployment notes for the ShiftIt / CarRadar Next.js app on Vercel.

**Do not commit `.env.local`.** Set secrets in Vercel project settings only.

See also: [vercel-beta-launch-checklist](./deployment/vercel-beta-launch-checklist.md).

---

## Firebase Authentication — authorized domains

If sign-in shows **“This domain is not authorized in Firebase Authentication”**, the current hostname is missing from Firebase.

**Fix (Firebase Console, not code):**

1. Open [Firebase Console](https://console.firebase.google.com/) → project **carradar-bd6fb**
2. **Authentication** → **Settings** → **Authorized domains**
3. Add each hostname that serves the app:

| Domain | When to add |
|--------|-------------|
| `localhost` | Local development |
| `carradar-ashen.vercel.app` | Current Vercel production deployment |
| `shiftit.club` | When custom domain is connected |
| `www.shiftit.club` | When `www` subdomain is connected |

Vercel preview URLs (`*.vercel.app`) may need to be added per deployment if previews use sign-in.

After adding domains, redeploy is **not** required; changes apply immediately.

---

## Routing

| Route | Behavior |
|-------|----------|
| `/` | Redirects to `/login` (main entry) |
| `/login` | Sign-in / sign-up (public) |
| `/discover` | Discovery home dashboard (public) |
| `/map`, `/events`, `/clubs`, etc. | Public browse pages (unchanged) |

Post-login default when no `?next=` is set: `/discover`.
