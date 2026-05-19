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
| `interestedCount` | number? | |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |

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
| `imageUrl` | string? | |
| `logoUrl` | string? | |
| `memberCount` | number? | |
| `verified` | boolean | |
| `featured` | boolean? | |
| `tags` | string[]? | |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |

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
| `instagram` | string? | |
| `tiktok` | string? | |
| `youtube` | string? | |
| `imageUrl` | string? | |
| `verifiedByClub` | boolean? | |
| `featured` | boolean? | |
| `createdAt` | string (ISO) | |
| `updatedAt` | string (ISO) | |

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

## `saved_places` (future)

Subcollection or top-level with `userId` + `placeId` + `placeType`.

## Indexes (recommended)

- `car_shops`: `status` + `featured` (desc)
- `car_events`: `status` + `startTime` (asc)
- `communities`: `status` + `featured` (desc)
- `submissions`: `status` + `createdAt` (desc)

## Security rules

See `firestore.rules` in the repo root and the **Security model (Day 11)** section under `users` above.
