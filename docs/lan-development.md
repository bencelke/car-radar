# LAN development (ShiftIt)

Use this when testing the app from another device on the same Wi-Fi (for example a family member’s laptop or phone).

## Two separate issues

| Symptom | Cause | Fix |
|---------|--------|-----|
| `Blocked cross-origin request … /_next/webpack-hmr from "…"` | Next.js dev HMR blocks untrusted origins | `allowedDevOrigins` in `next.config.ts` + restart |
| `club_members` / `users` **permission-denied** in console | Firestore security rules vs query/write shape | Rules + repository alignment; deploy rules to `carradar-bd6fb` |

Do not treat Firestore errors as a LAN networking problem.

## Start the dev server for LAN

On the **host PC** (where the repo runs):

```powershell
npm run dev:lan
```

This binds to `0.0.0.0` so other devices on the network can connect. Normal localhost-only development:

```powershell
npm run dev
```

After changing `next.config.ts`, always restart and clear the cache:

```powershell
Ctrl + C
Remove-Item -Recurse -Force .next
npm run dev:lan
```

## Find the host PC Wi-Fi IP

The blocked HMR origin (`192.168.68.112` in a recent session) is the **client device** that Next.js blocked — not necessarily the URL you type in the browser.

On the **host PC**:

1. Open PowerShell
2. Run `ipconfig`
3. Find the active **Wi-Fi** adapter (not VirtualBox, VPN, or Ethernet unless that is your LAN)
4. Note **IPv4 Address** (example: `192.168.68.105`)

On the **other device** (son’s computer), open:

```text
http://<HOST-PC-WIFI-IP>:3000
```

Do **not** use:

- `localhost` or `127.0.0.1` on the other device (that points to the other device itself)
- `0.0.0.0` in the browser
- VirtualBox host-only IPs such as `192.168.56.1`
- VPN adapter addresses

## `allowedDevOrigins`

`next.config.ts` includes trusted LAN client origins for development only:

```ts
allowedDevOrigins: ["192.168.68.112"],
```

If another device gets the same HMR warning, add **that device’s IP** to the array (merge, do not replace existing entries), restart `npm run dev:lan`, and clear `.next`.

This is **not** production CORS. It does not apply to `next start` or Vercel.

## Windows Firewall

If the page does not load from another device:

1. When Windows asks, allow **Node.js** on **Private** networks
2. Or: Windows Security → Firewall → Allow an app → Node.js → Private
3. Confirm both devices use the **same Wi-Fi**
4. Confirm the router does not use **AP/client isolation** (guest Wi-Fi often blocks device-to-device traffic)

## Auth over LAN

| Method | LAN over raw IP |
|--------|------------------|
| Email / password | Usually works if Firebase env points to `carradar-bd6fb` |
| Google / Apple OAuth | Often **fails** — redirect URIs and authorized domains expect `localhost` or HTTPS domains |

For social login testing:

- Use `http://localhost:3000` on the development PC, or
- Use a Vercel preview / HTTPS tunnel with the domain added in Firebase Console → Authentication → Authorized domains

Do not weaken OAuth or authorized-domain settings for LAN IPs.

## Firestore checks

Verify project alignment:

```powershell
npm run firebase:check
```

After rule changes, deploy to **carradar-bd6fb** only:

```powershell
firebase login
firebase use carradar-bd6fb
firebase deploy --only firestore:rules,firestore:indexes
```

### Expected behavior

- **Public club members:** queries use `where("status", "==", "approved")`; rules allow reads when `status == 'approved'`
- **Own profile:** signed-in user can create/update `users/{uid}` with `role: "user"`, `isAdmin: false`, and allowed self-update fields (including Instagram fields)

## Manual LAN test checklist

1. Host: `npm run dev:lan`
2. Host: `http://localhost:3000` — works
3. Other device: `http://<HOST-PC-WIFI-IP>:3000` — page loads
4. No `/_next/webpack-hmr` blocked warning in the host terminal
5. Navigation, map, and mobile menu work; hot reload updates both devices
6. `/clubs` — approved members load without `club_members` permission errors
7. Sign in → `/profile` — profile sync/update without `users` permission errors
