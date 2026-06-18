# Event check-in (QR + organizer verification)

ShiftIt event check-in lets club organizers open a short-lived QR session at a meet. Attendees scan or open a link, sign in, and confirm once. There is **no continuous GPS tracking**, geofencing, or guest check-in without login.

## Flow

1. Organizer opens **Manage check-in** (`/clubs/{slug}/manage/events/{eventId}`) and taps **Start check-in**.
2. Server route `POST /api/events/{eventId}/check-in/open` generates a cryptographically random token (15-minute TTL).
3. Only the **SHA-256 hash** of the token is stored on the event document (`checkInTokenHash`). The raw token is returned once to the organizer UI for the QR code and copy link.
4. QR / link: `/events/{eventSlug}/check-in?token={token}`.
5. Attendee opens the page. If signed out, they are sent to `/login?next=…` with the token preserved.
6. Attendee taps **Check in to this event** → `POST /api/events/{eventId}/check-in/verify` validates token + auth and creates `event_checkins/{eventId}_{userId}` via Admin SDK (or mock store in dev without service account).
7. Event `checkedInCount` increments in a Firestore transaction (no duplicate check-ins).
8. Organizer sees attendee list; public event page shows aggregate count and open/closed badge only.
9. Organizer **Close check-in** or token expiry invalidates further scans.

## Token security

| Concern | Approach |
|--------|----------|
| Raw token in Firestore | **Never** stored permanently |
| Stored value | `checkInTokenHash` (SHA-256 hex) on `car_events` |
| TTL | 15 minutes (`CHECK_IN_TOKEN_TTL_MS`) |
| Rotation | Opening/rotating check-in writes a new hash and expiry |
| Closed session | `checkInStatus: "closed"` rejects verify |
| Client writes to `event_checkins` | **Denied** in `firestore.rules` |

**Production requirement:** Firebase Admin SDK on server routes (`secrets/firebase-service-account.json` or env). Without Admin, dev falls back to in-memory mock — not suitable for production fraud resistance.

Token verification cannot be done securely in Firestore rules alone; keep verify/open/close on server routes.

## Firestore

### Collection: `event_checkins`

Deterministic document ID: `{eventId}_{userId}`.

See [firestore-schema.md](./firestore-schema.md) for fields.

### Event fields (`car_events`)

- `checkInEnabled`, `checkInStatus` (`open` \| `closed`)
- `checkInTokenHash`, `checkInTokenExpiresAt` (hash + expiry only)
- `checkedInCount`, `checkInOpenedAt`, `checkInClosedAt`, `checkInOpenedByUid`

## Authorization

Organizers who can manage check-in (reuse `lib/clubs/club-auth.ts`):

- Global admin (`users.role === "admin"` or `isAdmin`)
- Club `ownerUid`
- UID in `adminUids` or `managerUids`

Helper: `canManageEvent()` / `assertCanManageEvent()` in server service.

## Attendee privacy

- Public users see **aggregate** `checkedInCount` and open/closed status on the event page.
- Full attendee list is only available to organizers via authenticated API (`GET …/check-in/attendees`) and manage UI.
- Users may read **their own** check-in document when rules + Auth allow.
- No emails or private profile fields in public UI; snapshots store display name / avatar URL at check-in time only.

## Manual check-in

Organizers can check in a member by Firebase Auth UID (`POST …/check-in/manual`, method `organizer_manual`). No guest registration flow.

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/events/[eventId]/check-in/open` | POST | Start/rotate session, return token + URL |
| `/api/events/[eventId]/check-in/close` | POST | Close session |
| `/api/events/[eventId]/check-in/verify` | POST | Attendee check-in with token |
| `/api/events/[eventId]/check-in/attendees` | GET | Organizer attendee list |
| `/api/events/[eventId]/check-in/remove` | POST | Remove attendee, decrement count |
| `/api/events/[eventId]/check-in/manual` | POST | Organizer manual check-in |

All require `Authorization: Bearer {Firebase ID token}` except verify (attendee must be signed in).

## Known limitations

- `checkedInCount` is maintained via transactions in API; at very high scale, move to Cloud Functions.
- Club managers can still update other event fields via client Firestore rules; check-in token fields should only be written server-side in production discipline.
- Manual check-in uses raw UID entry (no member search UI yet).
- Rotating QR requires organizer action; no automatic rotation Cloud Function.
- Mock mode without Admin SDK does not enforce real multi-client security.

## Related code

- Token helpers: `lib/events/check-in-token.ts`
- Server logic: `lib/server/event-check-in-service.ts`
- Client reads: `lib/repositories/event-checkins.ts`
- UI: `components/events/EventCheckIn*.tsx`
- Public page: `app/events/[slug]/check-in/page.tsx`
