# ShiftIt PWA & Mobile Readiness

This document describes the mobile-app-ready PWA foundation added to ShiftIt (CarRadar web app).

## What was added

### PWA metadata

| Asset | Location |
|-------|----------|
| Web manifest | `public/manifest.webmanifest` |
| Placeholder SVG icons | `public/icons/shiftit-icon.svg`, `shiftit-icon-maskable.svg` |
| Dynamic favicon | `app/icon.tsx` |
| Apple touch icon | `app/apple-icon.tsx` |
| Shared PWA config | `lib/pwa/config.ts` |

**Manifest highlights**

- Name: **ShiftIt**
- `display: standalone`
- `theme_color: #ff3b1f`
- `background_color: #050505`
- `orientation: portrait-primary`
- Categories: social, lifestyle, navigation

Root layout (`app/layout.tsx`) exports:

- `manifest` link
- `theme-color` via Next.js `viewport`
- `appleWebApp` metadata (`capable`, `black-translucent` status bar)
- `viewportFit: cover` for iOS safe areas

### Mobile app shell

| Piece | Location |
|-------|----------|
| Bottom tab navigation (mobile only) | `components/layout/MobileBottomNav.tsx` |
| Shell wiring | `components/layout/AppShell.tsx` |
| Nav config | `lib/navigation/mobile-bottom-nav.ts` |

**Bottom nav tabs:** Home · Map · Events · Shops · Clubs

Hidden on:

- `/login`
- `/admin/*`

Desktop keeps the existing top navigation; bottom nav is `md:hidden`.

### Safe areas & layout

`app/globals.css` includes:

- `--mobile-header-height` / `--mobile-bottom-nav-height`
- `env(safe-area-inset-*)` utilities (`.safe-area-bottom`, `.pb-safe`, etc.)
- Map viewport height accounts for header + bottom nav on mobile
- `overflow-x: clip` on `html` / `body` to prevent horizontal scroll
- `.tap-target` helper (44px minimum)

`PageShell` uses `min-w-0` so flex children do not overflow on narrow screens.

### Push notifications (placeholder only)

`lib/pwa/push-placeholder.ts` documents future architecture.

**Intentionally not added:**

- Firebase Cloud Messaging
- Service worker
- `Notification.requestPermission()`
- Background sync / offline Firestore

---

## Icon TODO

Replace placeholder icons before production marketing:

1. Export final brand mark as **PNG 192×192** and **512×512**
2. Add maskable **512×512** with safe-zone padding
3. Update `public/manifest.webmanifest` `icons` array
4. Replace `app/icon.tsx` / `app/apple-icon.tsx` or switch to static `app/icon.png`

---

## How to test installability

### Local (HTTPS required for full install prompt)

```bash
npm run dev
# or for LAN device testing:
npm run dev:lan
```

Use Chrome DevTools → **Application** → **Manifest**:

- Verify manifest loads from `/manifest.webmanifest`
- Check icons, theme color, display mode

### Lighthouse PWA audit

1. Open Chrome DevTools → **Lighthouse**
2. Categories: **Progressive Web App**
3. Test at **390px** mobile width
4. Review installability hints (icons, manifest, HTTPS)

> A service worker is **not** required for basic installability in modern Chrome, but some audits may suggest one for offline — we intentionally skip SW for now.

### iOS Safari

1. Open site in Safari
2. **Share → Add to Home Screen**
3. Confirm icon + standalone launch (no browser chrome)
4. Verify safe areas on iPhone with notch (status bar, home indicator)

### Android Chrome

1. Open site
2. **Install app** banner or menu → **Install**
3. Launch from home screen

---

## Manual QA checklist

| Viewport | Checks |
|----------|--------|
| 1440px desktop | Top nav, no bottom nav, pages readable |
| 768px tablet | Top nav, layout stacks cleanly |
| 390px / 430px mobile | Bottom nav visible, no horizontal overflow, map usable, tap targets ≥ 44px |

Pages to spot-check:

- `/` home
- `/map` full-height map + bottom nav clearance
- `/events`, `/clubs`, `/shops` card stacks
- `/profile`, `/submit` forms not covered by nav

---

## Future steps

### Push notifications

1. Add FCM to Firebase project (web push certificates)
2. Minimal service worker: `firebase-messaging-sw.js`
3. Store device tokens under `users/{uid}`
4. Reuse `lib/server/notification-service.ts` triggers
5. Request permission only after explicit user action (settings toggle)

### App store wrapping

Options when ready:

- **Capacitor** — wrap existing Next.js static/export or SSR proxy
- **PWA Builder** — generate store packages from manifest
- **TWA (Trusted Web Activity)** — Android Play Store from PWA URL

Keep one web codebase; native shells handle splash, icons, and store listing.

### Optional enhancements

- PNG maskable icons for stricter Lighthouse scores
- `beforeinstallprompt` UI for custom install CTA
- `display_override: ["window-controls-overlay"]` for desktop PWA
- Per-route `mobile-shell` variants (e.g. immersive map mode)

---

## Related files

```
app/layout.tsx
app/globals.css
app/icon.tsx
app/apple-icon.tsx
public/manifest.webmanifest
public/icons/
components/layout/AppShell.tsx
components/layout/MobileBottomNav.tsx
lib/pwa/config.ts
lib/pwa/push-placeholder.ts
lib/navigation/mobile-bottom-nav.ts
```
