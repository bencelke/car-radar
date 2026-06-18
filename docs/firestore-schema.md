# CarRadar Firestore Schema

Collections and fields aligned with `lib/types/domain.ts`. All listing entities use `status: ListingStatus` for moderation workflow.

## `car_shops`

Documents map to `CarShop`.

| Field | Type | Notes |
|-------|------|--------|
| `name` | string | Display name |
| `slug` | string? | Optional URL slug; public pages fall back to slugified `name` or document id |
| `category` | string | `PlaceCategory` enum value |
| `status` | string | `draft` \| `pending` \| `approved` \| `rejected` \| `archived` |
| `city` | string | |
| `country` | string | |
| `address` | string? | |
| `lat` | number? | |
| `lng` | number? | |
| `description` | string | |
| `instagram` | string? | |
| `website` | string? | |
| `phone` | string? | |
| `imageUrl` | string? | Firebase Storage URL later |
| `verified` | boolean | |
| `featured` | boolean? | Sort priority |
| `services` | string[] | |
| `brandsSupported` | string[]? | |
| `rating` | number? | |
| `reviewCount` | number? | |
| `sponsorLevel` | string? | `free` \| `verified` \| `featured` \| `sponsor` |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |

## `car_events`

Documents map to `CarEvent`.

| Field | Type | Notes |
|-------|------|--------|
| `title` | string | |
| `slug` | string? | Optional URL slug; public pages fall back to slugified `title` or document id |
| `type` | string | Meet, Cruise, Festival, etc. |
| `status` | string | ListingStatus |
| `city` | string | |
| `country` | string | |
| `address` | string? | |
| `lat` | number? | |
| `lng` | number? | |
| `description` | string | |
| `startTime` | string (ISO) | Required for upcoming queries |
| `endTime` | string (ISO)? | |
| `organizerName` | string? | |
| `organizerInstagram` | string? | |
| `sourceUrl` | string? | |
| `imageUrl` | string? | |
| `verified` | boolean | |
| `featured` | boolean? | |
| `interestedCount` | number? | RSVP summary (maintained on write in V1) |
| `goingCount` | number? | RSVP summary |
| `notGoingCount` | number? | Admin/club manager visibility |
| `checkedInCount` | number? | **Future** check-in phase — no UI yet |
| `clubId` | string? | Owning club for club-managed events |
| `clubName` | string? | Denormalized display |
| `meetingRoute` | string? | Route description |
| `maxAttendance` | number? | Capacity hint |
| `createdByUid` | string? | Firebase Auth uid |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |

Public read includes `approved` and `cancelled` events.

## `club_follows`

Document id: `{userId}_{clubId}` (deterministic).

| Field | Type | Notes |
|-------|------|--------|
| `userId` | string | Firebase Auth uid |
| `clubId` | string | Target club |
| `createdAt` | string (ISO) | |

## `club_announcements`

| Field | Type | Notes |
|-------|------|--------|
| `clubId` | string | |
| `authorUid` | string | |
| `authorDisplayName` | string? | |
| `title` | string | |
| `body` | string | |
| `type` | string | `meet` \| `route_change` \| `cancellation` \| `sponsor` \| `club_news` \| `general` |
| `status` | string | `draft` \| `published` \| `archived` |
| `relatedEventId` | string? | Optional link |
| `publishedAt` | string (ISO)? | |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO)? | |

Public read: `status == published` only.

## `event_rsvps`

Document id: `{eventId}_{userId}` (deterministic).

| Field | Type | Notes |
|-------|------|--------|
| `eventId` | string | |
| `userId` | string | Firebase Auth uid |
| `status` | string | `going` \| `interested` \| `not_going` |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO)? | |

V1 updates `goingCount` / `interestedCount` on the event document after RSVP writes. At scale, move counters to Cloud Functions.

### Check-in fields on `car_events`

| Field | Type | Notes |
|-------|------|--------|
| `checkInEnabled` | boolean? | Organizer enabled check-in |
| `checkInStatus` | string? | `open` \| `closed` |
| `checkInTokenHash` | string? | SHA-256 of active QR token (never store raw token) |
| `checkInTokenExpiresAt` | string (ISO)? | Token expiry |
| `checkedInCount` | number? | Denormalized count of active check-ins |
| `checkInOpenedAt` | string (ISO)? | |
| `checkInClosedAt` | string (ISO)? | |
| `checkInOpenedByUid` | string? | Organizer who opened session |

See [event-check-in.md](./event-check-in.md) for QR flow and security.

## `event_checkins`

Document id: `{eventId}_{userId}` (deterministic — one active check-in per user per event).

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Same as document id |
| `eventId` | string | |
| `userId` | string | Firebase Auth uid |
| `memberProfileId` | string? | Optional club member profile |
| `status` | string | `checked_in` \| `removed` |
| `method` | string | `qr` \| `organizer_manual` |
| `checkedInAt` | string (ISO) | |
| `removedAt` | string (ISO)? | When organizer removes |
| `checkedInByUid` | string? | Organizer uid for manual check-in |
| `displayNameSnapshot` | string? | Display at check-in time |
| `avatarUrlSnapshot` | string? | |
| `clubNameSnapshot` | string? | |

**Writes:** server routes + Admin SDK only (`firestore.rules` denies client create/update/delete). **Reads:** own document for user; club managers + admin for attendee list.

Counter maintenance uses Firestore transactions in `lib/server/event-check-in-service.ts`. At scale, prefer Cloud Functions for `checkedInCount`.

## `notifications`

In-app notification records. Auto-generated document IDs with deterministic dedupe via hashed doc id in server service.

| Field | Type | Notes |
|-------|------|--------|
| `recipientUid` | string | Firebase Auth uid |
| `type` | string | See `NotificationType` in domain types |
| `title` | string | Primary headline (often club or event name) |
| `body` | string | Detail text |
| `status` | string | `unread` \| `read` \| `archived` |
| `clubId` | string? | |
| `eventId` | string? | |
| `announcementId` | string? | |
| `memberId` | string? | Reserved for future claim approvals |
| `actionUrl` | string? | In-app deep link |
| `metadata` | map? | Includes `dedupeKey` |
| `createdAt` | string (ISO) | |
| `readAt` | string (ISO)? | |
| `archivedAt` | string (ISO)? | |

**Creates:** server / Admin SDK only. **Reads/updates:** recipient only (status fields).

See [notifications.md](./notifications.md).

## Club management fields (`clubs`)

| Field | Type | Notes |
|-------|------|--------|
| `ownerUid` | string? | Primary club owner |
| `adminUids` | string[]? | Club admins |
| `managerUids` | string[]? | Event/announcement managers |
| `followerCount` | number? | Optional denormalized count |

Authorization helper: `lib/clubs/club-auth.ts` → `canManageClub()`.

## Public map policy

Member/car markers are **not** rendered on the public map (`/` and `/map`). Member profiles remain at `/members` and club rosters. Map shows clubs, events, shops, and community zones only.

## `clubs`

Documents map to `Club`.

| Field | Type | Notes |
|-------|------|--------|
| `name` | string | |
| `slug` | string | URL slug, unique |
| `type` | string | Club focus label |
| `category` | string? | Filter category |
| `status` | string | ListingStatus |
| `city` | string | |
| `country` | string | |
| `area` | string? | Region / base area |
| `description` | string | |
| `instagram` | string? | |
| `tiktok` | string? | |
| `youtube` | string? | |
| `website` | string? | |
| `imageUrl` | string? | URL or path only — not binary; use Firebase Storage or `public/` paths in dev |
| `coverImageUrl` | string? | Club cover hero |
| `logoUrl` | string? | Club logo |
| `shortDescription` | string? | |
| `vehicleTypes` | string[]? | |
| `primaryBrands` | string[]? | |
| `joinRequirements` | string? | |
| `meetingStyle` | string? | |
| `memberCount` | number? | |
| `verified` | boolean | |
| `featured` | boolean? | |
| `tags` | string[]? | |
| `lat` | number? | Club map pin (static, not live GPS) |
| `lng` | number? | |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |
| `createdByUid` | string? | Admin who imported/created |
| `updatedByUid` | string? | Last admin editor |

## `club_members`

Documents map to `ClubMember`.

| Field | Type | Notes |
|-------|------|--------|
| `clubId` | string | FK to `clubs` |
| `displayName` | string | |
| `nickname` | string? | |
| `status` | string | `pending` \| `approved` \| `rejected` \| `archived` |
| `city` | string | |
| `country` | string | |
| `area` | string? | |
| `carMake` | string? | |
| `carModel` | string? | |
| `carYear` | string? | |
| `carName` | string? | |
| `buildSummary` | string? | |
| `buildTags` | string[]? | |
| `instagramHandle` | string? | Bare username, no `@`; display as `@handle` in UI |
| `instagram` | string? | `https://instagram.com/{handle}` — external link only, no scraping |
| `tiktok` | string? | |
| `youtube` | string? | |
| `imageUrl` | string? | URL or site path only (e.g. `/data/clubs/wbn/images/{id}.webp`) — not binary; files live in `public/` locally or Firebase Storage later |
| `avatarUrl` | string? | Same as `imageUrl` when set; external link only for socials — no Instagram scraping |
| `clubName` | string? | Denormalized display |
| `role` | string? | `member` \| `club_owner` \| `club_admin` \| `founder` \| `road_captain` \| `photographer` |
| `roleLabel` | string? | Optional custom label override |
| `lat` | number? | Map pin (not live GPS) |
| `lng` | number? | Map pin |
| `verifiedByClub` | boolean? | |
| `featured` | boolean? | |
| `claimStatus` | string? | `unclaimed` \| `pending` \| `claimed` \| `rejected` — claim flow not in UI yet |
| `claimedByUid` | string? \| null | Firebase Auth uid after claim approved |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |
| `createdByUid` | string? | Admin importer |
| `updatedByUid` | string? | Last editor |

Member profiles are **public listings** and do not require a `users` document. A signed-in user may claim a profile later (see [firebase-data-import.md](./firebase-data-import.md)).

## `communities` (legacy)

Documents map to `Community`. Prefer `clubs` for new data.

| Field | Type | Notes |
|-------|------|--------|
| `name` | string | |
| `type` | string | Club type label |
| `status` | string | ListingStatus |
| `city` | string | |
| `country` | string | |
| `description` | string | |
| `instagram` | string? | |
| `website` | string? | |
| `imageUrl` | string? | |
| `memberCount` | number? | |
| `verified` | boolean | |
| `featured` | boolean? | |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |

## `community_zones`

Documents map to `CommunityZone` (club areas on map).

| Field | Type | Notes |
|-------|------|--------|
| `name` | string | |
| `communityId` | string? | FK to `communities` doc id |
| `type` | string | e.g. Club Area |
| `status` | string | ListingStatus |
| `city` | string | |
| `country` | string | |
| `centerLat` | number? | |
| `centerLng` | number? | |
| `radiusMeters` | number? | |
| `description` | string | |
| `instagram` | string? | |
| `website` | string? | |
| `verified` | boolean | |
| `confidenceScore` | number? | 0–1 |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |

## `submissions`

User-submitted content awaiting review. Maps to `Submission` in `lib/types/domain.ts`. Documents are **never auto-published**; new rows are created with `status: "pending"`. Day 7+ admin workflow will approve/reject and publish to listing collections.

### Types

| `type` | Purpose |
|--------|---------|
| `shop` | New tuning / mod / wrap / detail shop |
| `event` | Meet, cruise, show, festival |
| `club` | Car club or crew |
| `member` | Club member / build profile |
| `correction` | Fix wrong data on an existing listing |
| `community` | Legacy type in types only; prefer `club` |

### Base fields (all types)

| Field | Type | Notes |
|-------|------|--------|
| `type` | string | See types above |
| `status` | string | `pending` \| `approved` \| `rejected` \| `needs_changes` — always `pending` on create |
| `name` | string | Display name (for corrections, same as `targetName`) |
| `category` | string? | Aligns with CSV `category` |
| `country` | string? | |
| `city` | string | Required |
| `area` | string? | Region / district |
| `address` | string? | Street line |
| `lat` | number? | Optional, no geocoding yet |
| `lng` | number? | Optional |
| `instagram` | string? | Normalized to `https://` in repository |
| `tiktok` | string? | |
| `youtube` | string? | |
| `website` | string? | |
| `sourceUrl` | string? | Original listing / post URL |
| `description` | string | Required (build summary for members) |
| `tags` | string[]? | Lowercase, comma-split on ingest |
| `submittedByEmail` | string? | Optional; from form or auth later |
| `submittedByUid` | string? | When Firebase Auth is wired |
| `permissionConfirmed` | boolean? | Required for `member` submissions |
| `createdAt` | string (ISO) | Set on create |
| `updatedAt` | string (ISO)? | Set on create and status changes |
| `reviewedAt` | string (ISO)? | Set when status changes in admin review |
| `reviewedBy` | string? | Moderator uid (when Auth is added) |
| `reviewNote` | string? | Required for `rejected` and `needs_changes` |
| `approvedEntityId` | string? | Target listing doc id after Day 8 publish |

### Type-specific fields

**`shop`:** `services` (string[]), `brandsSupported` (string[])

**`event`:** `startTime`, `endTime` (ISO strings), `organizerName`, `organizerInstagram`

**`club`:** `clubType`, `memberCountEstimate` (number)

**`member`:** `clubName`, `carMake`, `carModel`, `carYear`, `carName`, `buildSummary`, `buildTags` (string[])

**`correction`:** `targetType` (`shop` \| `event` \| `club` \| `member` \| `zone` \| `other`), `targetName`, `correctionDetails` (also stored in `name` / `description`)

### CSV import alignment

Future bulk import columns: `name`, `type`, `category`, `country`, `city`, `area`, `address`, `lat`, `lng`, `instagram`, `tiktok`, `youtube`, `website`, `description`, `tags`, `source_url`, `status`.

### Review statuses

| Status | Meaning |
|--------|---------|
| `pending` | Awaiting moderator review (default on create) |
| `approved` | Accepted; published to public collection when type is shop/event/club/member |
| `rejected` | Declined with `reviewNote` |
| `needs_changes` | Sent back to submitter context with `reviewNote` |

Legacy documents without `needs_changes` remain valid; treat unknown statuses as `pending` in UI if needed.

### Workflow (Day 7–9)

1. User submits via `/submit` → `createSubmission()` → `addDoc` to `submissions` with `status: "pending"` (or mock store if Firebase env is missing).
2. Moderators open `/admin` → filter by status → review submission.
3. For publishable types, moderators may edit a **publish draft** (name, location, links, tags, event/member fields) before approval.
4. **Duplicate warning** (heuristic, non-blocking): compares draft/submission against approved listings (seed + session-published + Firestore when configured). Same name+city, matching website/Instagram, or event name+date triggers a warning — approval is still allowed.
5. On **Approve** for `shop`, `event`, `club`, `member` (legacy `community` → club): `publishApprovedSubmission()` uses the edited draft when provided, writes the public listing, and sets `approvedEntityId`, `publishedCollection`, `reviewedAt`.
6. On **Approve** for `correction`: status-only (no public entity). **Day 10 TODO:** apply correction to target listing.
7. Reject / needs changes never publish.

### Publish draft (Day 9)

In-memory shape used in `/admin` (not stored as its own Firestore collection):

| Field | Notes |
|-------|--------|
| `name`, `description`, `city`, `country` | Required for publish validation |
| `address`, `lat`, `lng` | Optional; missing coords show a non-blocking map warning |
| `websiteUrl`, `instagramUrl`, `tags` | Comma-separated tags in UI |
| `startTime`, `endTime` | Events |
| `clubName`, `carMake`, `carModel`, `carYear`, `buildSummary` | Members |

Helpers: `createPublishDraftFromSubmission`, `validatePublishDraft`, `mapPublishDraftToPublicEntity`.

### Published listing collections (Day 8)

Logical names map to Firestore collections used by repositories:

| `publishedCollection` | Firestore collection | Domain type |
|----------------------|----------------------|-------------|
| `shops` | `car_shops` | `CarShop` |
| `events` | `car_events` | `CarEvent` |
| `clubs` | `clubs` | `Club` |
| `members` | `club_members` | `ClubMember` |

Published entities include `status: "approved"`, timestamps, and optional `sourceSubmissionId` linking back to the submission.

### CSV import (Day 10)

Admin-only bulk import at `/admin` → **CSV import** tab. Rows are parsed with PapaParse and created via `createSubmission()` — always `status: pending`, even if the CSV column says `approved`.

| CSV column | Maps to |
|------------|---------|
| `name`, `type`, `city`, `description` | Required |
| `category`, `country`, `area`, `address`, `lat`, `lng` | Optional |
| `instagram`, `tiktok`, `youtube`, `website`, `source_url` | Optional links |
| `tags` | Comma or semicolon → lowercase `tags[]` |
| `status` | Ignored (warning only) |

Optional submission fields: `importSource: "csv"`, `importedAt` (ISO).

Sample file: `/public/samples/car-radar-import-sample.csv`

**Production:** restrict `/admin` and CSV import to moderators only (auth not implemented yet).

### Day 11+ TODO

- Apply approved **correction** submissions to target listings
- Stronger duplicate detection (fuzzy merge, block-on-duplicate option)
- Optional alias collections (`shops` vs `car_shops`) cleanup if consolidating naming
- Persist publish drafts on submission for multi-session admin review

## `users`

Firebase Auth profile document: `users/{uid}`.

| Field | Type | Notes |
|-------|------|--------|
| `email` | string | From Firebase Auth |
| `role` | string | `user` \| `admin` |
| `isAdmin` | boolean? | When `true`, grants admin (along with `role === "admin"`) |
| `createdAt` | string (ISO)? | |
| `updatedAt` | string (ISO)? | |

On first sign-in, the app creates `role: "user"` if the document is missing. **Do not hardcode admin emails in app code.** Promote the first admin manually in Firebase Console (see README).

### Security model (Day 11)

| Action | Who |
|--------|-----|
| Read approved listings (`car_shops`, `car_events`, `clubs`, `club_members`, `community_zones`, `communities`) | Public |
| Create `submissions` with `status: pending` | Anyone (no auth required) |
| Read/update/delete `submissions` | Admins only |
| Write listing collections (publish, CSV import path after approve) | Admins only |
| Read/write own `users/{uid}` | Signed-in user |
| Set `role` / `isAdmin` on any user | Admins only (or Console during bootstrap) |

Rules file: `firestore.rules`. Deploy with Firebase CLI when ready:

```bash
firebase deploy --only firestore:rules
```

Until rules are deployed, the Firebase Console default test mode may allow broader access — treat that as temporary for development only.

Until rules are deployed, the Firebase Console default test mode may allow broader access — treat that as temporary for development only.

## `garages`

Documents map to `GarageProfile`. One garage per owner in V1.

| Field | Type | Notes |
|-------|------|--------|
| `ownerUid` | string | Firebase Auth uid (immutable after create) |
| `memberProfileId` | string? | Linked `club_members` doc when claimed |
| `displayName` | string | Public display name |
| `instagramHandle` | string? | Without `@` |
| `instagram` | string? | Full URL |
| `clubId` | string? | |
| `clubName` | string? | Denormalized |
| `city` | string? | |
| `area` | string? | |
| `country` | string? | |
| `visibility` | string | `public` \| `club_only` \| `private` |
| `status` | string | `draft` \| `published` \| `archived` |
| `primaryCarId` | string? | Points at primary `garage_cars` doc |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO)? | |

Public read when `visibility == public` and `status == published`.

## `garage_cars`

Documents map to `GarageCar`.

| Field | Type | Notes |
|-------|------|--------|
| `garageId` | string | Parent garage |
| `ownerUid` | string | Must match garage owner |
| `make` | string | |
| `model` | string | |
| `year` | string? | |
| `trim` | string? | |
| `generation` | string? | |
| `drivetrain` | string? | |
| `transmission` | string? | |
| `engine` | string? | |
| `horsepower` | number? | |
| `torqueNm` | number? | |
| `buildStage` | string? | `stock` \| `stage_1` … `custom` |
| `buildSummary` | string? | |
| `primaryImageUrl` | string? | Firebase Storage download URL |
| `primaryImageStoragePath` | string? | e.g. `garage-images/{uid}/{carId}/primary.webp` |
| `imageSizeBytes` | number? | |
| `imageContentType` | string? | |
| `imageUpdatedAt` | string (ISO)? | |
| `tags` | string[]? | |
| `status` | string | `draft` \| `published` \| `archived` |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO)? | |

## `garage_mods`

Documents map to `GarageMod`.

| Field | Type | Notes |
|-------|------|--------|
| `carId` | string | Parent car |
| `ownerUid` | string | |
| `category` | string | engine, turbo, exhaust, … |
| `name` | string | |
| `brand` | string? | |
| `description` | string? | |
| `installedAt` | string (ISO)? | |
| `status` | string | `planned` \| `ordered` \| `installed` \| `removed` |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO)? | |

## `garage_updates`

Documents map to `BuildProgressUpdate`.

| Field | Type | Notes |
|-------|------|--------|
| `carId` | string | Parent car |
| `ownerUid` | string | |
| `title` | string | |
| `body` | string? | |
| `type` | string | `mod_added`, `dyno_update`, `general`, … |
| `relatedModId` | string? | |
| `horsepowerSnapshot` | number? | |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO)? | |

See [docs/garage-system.md](garage-system.md) for V1 scope and image paths.

## `garage_follows`

Documents map to `GarageFollow`. Deterministic id: `{followerUid}_{garageId}`.

| Field | Type | Notes |
|-------|------|--------|
| `followerUid` | string | Firebase Auth uid |
| `garageId` | string | Target garage |
| `garageOwnerUid` | string | Denormalized |
| `createdAt` | string (ISO) | |

## `garage_feed_items`

Documents map to `GarageFeedItem`. Generated from garage/build actions only.

| Field | Type | Notes |
|-------|------|--------|
| `garageId` | string | |
| `carId` | string? | |
| `ownerUid` | string | Garage owner |
| `type` | string | `mod_added`, `progress_update`, … |
| `title` | string | |
| `body` | string? | |
| `imageUrl` | string? | |
| `visibility` | string | `public` \| `followers` (V1 uses public) |
| `dedupeKey` | string? | Optional idempotency |
| `createdAt` | string (ISO) | |

See [docs/social-following.md](social-following.md).

## `share_links`

Optional tracked share URLs (future campaign use).

## `user_invites`

Invite codes as document IDs. Types: `join_shiftit`, `join_club`, `claim_profile`, `event_invite`.

## `share_analytics`

Privacy-safe share/invite events (`link_copied`, `card_downloaded`, etc.). Admin read only.

See [docs/share-and-invites.md](share-and-invites.md).

## `saved_places` (future)

Subcollection or top-level with `userId` + `placeId` + `placeType`.

## Indexes (recommended)

- `car_shops`: `status` + `featured` (desc)
- `car_events`: `status` + `startTime` (asc)
- `communities`: `status` + `featured` (desc)
- `submissions`: `status` + `createdAt` (desc)
- `garages`: `ownerUid` + `status`
- `garages`: `memberProfileId` (for member profile linking)
- `garage_cars`: `garageId` + `status`
- `garage_mods`: `carId` + `status` + `createdAt` (desc)
- `garage_updates`: `carId` + `createdAt` (desc)
- `garage_follows`: `followerUid` + `createdAt` (desc)
- `garage_follows`: `garageId` + `createdAt` (desc)
- `garage_feed_items`: `visibility` + `createdAt` (desc)
- `garage_feed_items`: `garageId` + `visibility` + `createdAt` (desc)
- `garages`: `status` + `visibility` + `lastActivityAt` (desc)
- `garages`: `status` + `visibility` + `followerCount` (desc)
- `garages`: `status` + `visibility` + `featured` + `lastActivityAt` (desc)

## Security rules

See `firestore.rules` in the repo root and the **Security model (Day 11)** section under `users` above.
