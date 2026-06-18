# ShiftIt product roadmap (excerpt)

## Shipped — community foundation

- **Public map:** clubs, events, shops, community zones only (member car markers removed)
- **Club follows:** `club_follows` collection, follow button on club pages
- **Club announcements:** published feed on club pages; managers create via `/clubs/[slug]/manage`
- **Club events:** structured create/edit/cancel by club managers
- **Event RSVP:** going / interested / not going with summary counts on events
- **Meet Finder:** `/events` map + list filters (date, city, followed clubs)

## Club management authorization

Set on `clubs/{id}` in Firestore (Console or admin tools):

- `ownerUid` — primary owner Firebase Auth uid
- `adminUids` — array of admin uids
- `managerUids` — array of manager uids

Global app admins (`users/{uid}` with `role: admin` or `isAdmin: true`) can manage any club.

## Deferred (later phases)

- Live GPS / member radar on map (opt-in, privacy controls)
- Event check-in (`event_checkins`, geofence or QR)
- Push notifications for announcements / RSVP / route changes
- Friend-to-friend following
- Event comments and media galleries
- Share links and referral invites
- Marketplace and route navigation
- Cloud Functions for RSVP/follow counter denormalization at scale
