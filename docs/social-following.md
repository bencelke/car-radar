# Social following and garage activity feed

ShiftIt lets users follow public garage builds and see build activity in a lightweight feed. This is **not** a generic social network — no comments, likes, DMs, or friend requests in V1.

## Garage follow model

Collection: `garage_follows`

| Field | Notes |
|-------|--------|
| `followerUid` | Firebase Auth uid |
| `garageId` | Target garage |
| `garageOwnerUid` | Denormalized owner |
| `createdAt` | ISO timestamp |

**Deterministic document ID:** `{followerUid}_{garageId}` prevents duplicate follows.

### Rules

- Only **public + published** garages can be followed.
- Users **cannot follow their own garage**.
- `followerCount` on `garages` is updated in the **same Firestore transaction** as follow/unfollow create/delete.
- Counter updates are rules-gated: ±1 only when the matching follow doc exists / was removed in the same transaction.

Future at scale: Cloud Functions or aggregate workers for counters and fan-out feeds.

## Feed model

Collection: `garage_feed_items`

Feed items are **generated only from known garage actions** (publish, photo, mod, HP, build stage, progress). They are not free-form posts.

| Type | Trigger |
|------|---------|
| `garage_published` | Garage published |
| `photo_updated` | Primary car image changed |
| `mod_added` | Mod created |
| `mod_installed` | Mod status → installed |
| `horsepower_updated` | HP field changed |
| `build_stage_updated` | Build stage changed |
| `progress_update` / `milestone` | Build progress entry |

Feed generation is **non-blocking** — failures log a warning and do not roll back the primary garage write.

Optional `dedupeKey` stabilizes document IDs for idempotent events (e.g. publish, photo path).

## Personalized feed strategy (beta)

1. Query `garage_follows` for followed `garageId`s.
2. Batch `garage_feed_items` queries with Firestore `in` (10 IDs per batch).
3. Merge and sort by `createdAt` client-side in the repository layer.

Future: fan-out on write, aggregated timeline collection, or Cloud Functions.

## Privacy

| Garage visibility | Follow | Public feed | Feed items |
|-------------------|--------|-------------|------------|
| `public` + published | Yes | Yes | `visibility: public` |
| `club_only` | No (V1) | No | Not created |
| `private` | No | No | Not created |

Follow documents are readable only by follower, garage owner, or admin — not public follower lists.

## Notifications

- `garage_followed` — optional notify garage owner when someone follows (authenticated owners only).
- No notifications to all followers on every small edit in this phase — the feed handles retention.

## Deferred

- Comments, likes, reactions
- Friend requests, blocking/muting
- Algorithmic recommendations
- Push notifications for every build change
- Public follower list with PII
- `club_only` follow rules when club membership is enforceable in rules

See also [garage-system.md](garage-system.md).
