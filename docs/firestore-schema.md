# CarRadar Firestore Schema

Collections and fields aligned with `lib/types/domain.ts`. All listing entities use `status: ListingStatus` for moderation workflow.

## `car_shops`

Documents map to `CarShop`.

| Field | Type | Notes |
|-------|------|--------|
| `name` | string | Display name |
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

User-submitted content awaiting review. Maps to `Submission`.

| Field | Type | Notes |
|-------|------|--------|
| `type` | string | `shop` \| `event` \| `community` \| `correction` |
| `status` | string | `pending` \| `approved` \| `rejected` |
| `name` | string | |
| `category` | string? | |
| `city` | string | |
| `country` | string? | |
| `location` | string? | Free-form location line |
| `description` | string | |
| `instagram` | string? | |
| `website` | string? | |
| `submittedByEmail` | string? | When auth exists |
| `createdAt` | string (ISO) | |

On approve: create/update target collection doc and set submission `status` to `approved`.

## `users` (future)

Reserved for Firebase Auth profiles.

| Field | Type | Notes |
|-------|------|--------|
| `email` | string | |
| `displayName` | string? | |
| `role` | string? | `user` \| `moderator` \| `admin` |
| `createdAt` | string (ISO) | |

## `saved_places` (future)

Subcollection or top-level with `userId` + `placeId` + `placeType`.

## Indexes (recommended)

- `car_shops`: `status` + `featured` (desc)
- `car_events`: `status` + `startTime` (asc)
- `communities`: `status` + `featured` (desc)
- `submissions`: `status` + `createdAt` (desc)

## Security rules (placeholder)

- Public read: `status == approved` on listing collections
- Write submissions: authenticated or rate-limited anonymous (TBD)
- Admin writes: custom claims / role check (TBD)
