# Share cards and user invites

ShiftIt share tools help users spread garages, clubs, events, and shops outside the app with branded cards and trackable invite links.

## Share card architecture

1. **ShareCardRenderer** — fixed 1080×1350 portrait DOM layout with ShiftIt branding.
2. **html-to-image** — captures the off-screen export node to PNG.
3. **ShareQrCode** — compact QR (via existing `qrcode` package) pointing at the canonical URL with optional `source` / `campaign` query params.
4. **Web Share API** — on supported mobile browsers, shares PNG via `navigator.share({ files })`; otherwise downloads PNG and copies link.

Card types: garage/member, club, event, shop — all use the same renderer with different `ShareCardModel` data from `buildShareCardModel()`.

## Canonical URLs

| Entity | Path |
|--------|------|
| Garage | `/garage/{id}` |
| Member | `/members/{id}` |
| Club | `/clubs/{slug}` |
| Event | `/events/{slug}` |
| Shop | `/shops/{slug}` |
| Invite | `/invite/{code}` |

Tracking query params: `ref`, `source`, `campaign` (appended by `appendShareTracking()`).

Site origin: `NEXT_PUBLIC_SITE_URL` (fallback `http://localhost:3000` in dev).

## Web Share fallback

1. If `navigator.share` exists → native share (link or image file).
2. Else → copy link to clipboard with visible toast/feedback.
3. Analytics failures never block sharing.

## Invite types

| Type | Purpose |
|------|---------|
| `join_shiftit` | Generic signup |
| `join_club` | Follow/discover a club after join |
| `claim_profile` | Mapped member profile claim CTA (no auto-claim) |
| `event_invite` | Event RSVP discovery |

Invite codes are 10-character random strings used as Firestore document IDs.

## Profile claim limitation

Claim invites redirect to `/members/{id}?claim=1` after login. **`claimedByUid` is never set automatically.** Future verification: Instagram DM code, admin review, club admin approval.

## Open Graph

Dynamic OG images (`1200×630`) via `next/og` `ImageResponse` on garage, member, club, event, and shop routes. Branded gradient fallback when entity photos are unavailable.

## Analytics and privacy

`share_analytics` records: `link_copied`, `native_share`, `card_downloaded`, `invite_opened`, `invite_used`.

We do **not** store contact lists, phone numbers, or private Instagram data.

## Deferred

- Referral rewards / affiliate payouts
- Email/SMS invite delivery
- Social network posting APIs
- QR campaign dashboards
- Branded story template packs
- Automatic profile claim approval
