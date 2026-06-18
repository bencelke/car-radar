# In-app notifications

ShiftIt delivers **in-app notifications only** in this phase — no browser push, email, SMS, or FCM.

## Architecture

| Layer | Responsibility |
|-------|----------------|
| `notifications` collection | Source of truth per notification record |
| `lib/server/notification-service.ts` | Creates notifications via Admin SDK (mock fallback in dev) |
| `lib/notifications/create-*-notifications.ts` | Recipient targeting + dedupe keys |
| `lib/notifications/triggers.ts` | Fire-and-forget hooks from repos / check-in service |
| `app/api/notifications/trigger/route.ts` | Authorized client trigger for club/event actions |
| `lib/repositories/notifications.ts` | User reads, mark read/archive (client SDK) |
| UI | `NotificationBell`, popover, `/notifications` page |

Notification creation **does not block** primary actions (announcement publish, event save, check-in open). Failures log a safe warning only.

## Data model

See [firestore-schema.md](./firestore-schema.md) → `notifications`.

Optional denormalized fields on `users/{uid}`:

- `unreadNotificationCount`
- `lastNotificationAt`
- `notificationPreferences` (all default `true`)

User documents are **not** the notification source of truth.

## Recipient targeting

| Trigger | Recipients | Excludes |
|---------|------------|----------|
| Club announcement published | `club_follows` where `clubId` | Actor (author) |
| New club event | Club followers | Actor (creator) |
| Event update (time/location/route) | RSVPs `going` + `interested` | Actor |
| Event cancelled | RSVPs `going` + `interested` | Actor |
| Check-in opens | RSVPs `going` only | Actor |

Queries use `club_follows` by `clubId` and `event_rsvps` by `eventId` — never scans the full `users` collection.

## Dedupe behavior

Document IDs are deterministic hashes of `recipientUid + dedupeKey`:

- Announcement: `club_announcement:{announcementId}:{recipientUid}`
- New event: `club_event_created:{eventId}:{recipientUid}`
- Event update: includes `event.updatedAt` so each edit can notify once
- Cancellation: one per user per event
- Check-in open: includes `checkInOpenedAt` session timestamp

Re-running the same action does not create duplicate rows.

## Security

| Action | Who |
|--------|-----|
| Read notification | `recipientUid == auth.uid` |
| Mark read / archive | Same user; only `status`, `readAt`, `archivedAt` may change |
| Create notification | **Denied** on client — Admin SDK / server routes only |
| Trigger API | Bearer token + club/event manager authorization |

Organizers cannot send arbitrary custom notifications; only known trigger kinds are accepted.

## Real-time unread count

`subscribeUserNotifications()` uses Firestore `onSnapshot` on:

```
where recipientUid == uid orderBy createdAt desc limit N
```

Unread count is derived from loaded docs (`status === "unread"`). Listener cleans up on unmount. Mock mode polls every 5s.

## Indexes

See `firestore.indexes.json`:

- `notifications`: `recipientUid` + `createdAt`
- `notifications`: `recipientUid` + `status` + `createdAt`
- `club_follows`: `clubId` + `createdAt`
- `event_rsvps`: `eventId` + `status`

Deploy:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

## Privacy

Users only read their own notifications. No email addresses or private profile fields are stored on notification docs.

## Deferred

- Browser push / FCM
- Email / SMS
- Scheduled RSVP reminders (`event_reminder` type reserved)
- Notification preferences UI on profile (schema + defaults exist)
- Retention job (`deleteOldNotificationsForUser` placeholder)
- Cloud Functions for fan-out at scale
