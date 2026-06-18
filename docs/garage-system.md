# Garage system

ShiftIt garages let signed-in users manage a car build profile: identity, primary car, mods, build progress, and one optimized hero photo.

## V1 scope

- **One primary car per garage** — `GarageProfile.primaryCarId` points at a single `garage_cars` document. The data model supports multiple cars later; UI and onboarding only expose one vehicle.
- **No marketplace, galleries, video, comments, or public build following** in this phase.
- **Member linking** — if the user already has a claimed `club_members` profile (`claimedByUid` or `ownerUid`), they can connect it to their garage. Public member pages stay at `/members/[id]`; published garages live at `/garage/[id]`.

## Firestore collections

| Collection       | Purpose                                      |
|------------------|----------------------------------------------|
| `garages`        | Owner profile, visibility, publish status    |
| `garage_cars`    | Vehicle specs, build stage, primary image    |
| `garage_mods`    | Mod list per car                             |
| `garage_updates` | Build progress timeline entries              |

## Ownership and privacy

- `garages.ownerUid` must match the authenticated user on create/update.
- `ownerUid` cannot be changed after creation (enforced in security rules).
- **Public read** only when `visibility === "public"` **and** `status === "published"`.
- `club_only` and `private` garages are not readable by anonymous clients.
- Global admins can read/write for support (same pattern as other collections).

Related car/mod/update documents inherit visibility from the parent garage via security rules (`isPublicGarage()` helper).

## Image upload

- Client optimizes with `garage_primary` preset (~1400px, WebP, ~0.25–0.35 MB).
- Storage path: `garage-images/{ownerUid}/{carId}/primary.webp`
- Firestore stores `primaryImageUrl`, `primaryImageStoragePath`, plus optional size/content-type metadata.
- Raw/base64 images are not stored in Firestore.

## Mods and build progress

- **Mods** — categorized parts with status: `planned`, `ordered`, `installed`, `removed`.
- **Build progress** — chronological updates with types (`mod_added`, `mod_installed`, `dyno_update`, `photo_update`, `milestone`, `general`), optional horsepower snapshot and related mod reference.
- Mod arrays are **not** duplicated on `club_members`; link via `garage.memberProfileId` when needed.

## Routes

| Route        | Access                                      |
|--------------|---------------------------------------------|
| `/garage`    | Signed-in owner dashboard / onboarding      |
| `/garage/[id]` | Public published garage only              |
| `/members/[id]` | Club member profile (unchanged)          |

## Deferred

- Multiple vehicles per garage (UI)
- Public build following / share flows
- Gallery and video uploads
- VIN lookup, dyno verification, marketplace
