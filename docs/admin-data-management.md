# Admin data management

ShiftIt admins manage real club, member, and event data through the **Admin Dashboard** at `/admin`.

## Access

- Firebase Auth user with `users/{uid}.role === "admin"` **or** `isAdmin === true`
- No hardcoded admin email or shared password
- Non-admins see access denied with diagnostics in development
- Profile page shows **Admin Dashboard** button only for admins

## Workflow

1. Sign in as admin
2. **Clubs** tab — create/edit club, upload optimized cover
3. **Members & Cars** tab — add/edit roster entries, upload car photo
4. **Imports** tab — CSV / Google Sheets bulk import → Firestore
5. **Events** tab — create/edit/cancel meets linked to a club
6. **Submissions** tab — review public submissions
7. Public map/list surfaces approved clubs and events; users RSVP on event pages

## Imported members are not auth accounts

CSV/Firestore imports create **public profiles** in `club_members`. They do not create Firebase Auth users. `claimStatus` stays `unclaimed` until a future claim workflow.

## First admin setup

1. Configure Firebase (see `docs/firebase-setup.md`)
2. Sign up via `/login`
3. In Firestore Console, set `users/{yourUid}`:
   - `role: "admin"` or `isAdmin: true`
4. Refresh profile or re-login; open `/admin`

## Image uploads

All admin uploads are optimized client-side before Storage write. See `docs/image-optimization.md` for presets and paths.

## Club managers

Users in `clubs/{id}.ownerUid` or `managerUids` can manage their club at `/clubs/[slug]/manage` (events, announcements, limited profile edits). Global admins retain full access.
