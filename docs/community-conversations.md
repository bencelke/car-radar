# Community conversations

ShiftIt conversation is **context-based** — every post belongs to a club or event. There is no global chat, homepage composer, or private messaging in this phase.

## Collections

| Collection | Purpose |
|------------|---------|
| `posts` | Club posts and event discussion/updates |
| `post_comments` | Flat comments on posts |
| `post_reactions` | One `like` per user per post (`{postId}_{userId}`) |
| `post_reports` | User reports for moderation |

## Permissions

**Club posts:** approved claimed members, club managers, admins.

**Official club posts:** club managers and admins only.

**Event discussion:** any signed-in user for public approved/cancelled events.

**Official event updates:** event creator, managing club staff, admins.

**Moderation:** club/event managers and global admins.

## One image rule

- Preset: `community_post` (1400px, ~350KB WebP target)
- Paths: `community-posts/clubs/{clubId}/{postId}/image.webp` or `community-posts/events/{eventId}/{postId}/image.webp`
- Client optimization before upload; no base64 in Firestore

## Counters

`commentCount` and `reactionCount` are updated via Firestore **transactions** in repositories. Rules allow only ±1 changes on those fields. At higher scale, move counter maintenance to Cloud Functions.

## Cost controls

- Paginated reads (15 posts, 10 comments initial)
- No global real-time listeners
- Author display snapshots on write
- One image per post
- No video or galleries

## Deferred

- Garage/build comments
- Scene global feed page
- Private messages
- Nested comment UI
- Like notifications
- Polls, hashtags, reposts
