# Image optimization (CarRadar)

CarRadar stores **paths or URLs only** in JSON and Firestore — never image binaries.

## End-to-end workflow (WBN example)

### 1. Export from Google Sheets

1. Open the club sheet (columns: **Instagram · Car Model · Photo · Location**).
2. **Extensions → Apps Script** → paste `scripts/google-sheets/export-club-members-appscript.js`.
3. Set `CLUB_ID` / `CLUB_NAME`, save, reload the sheet.
4. **CarRadar Export → Export active sheet** (authorize Drive + URLs on first run).

See [google-sheets-club-export.md](./google-sheets-club-export.md).

### 2. Download from Google Drive

Exported photos land in:

```text
CarRadar Exports/{clubId}/images/
```

Download the folder (e.g. `wbn-bambam-84.png` from the script). Formats may be PNG/JPG.

### 3. Resize and compress

| Guideline | Value |
|-----------|--------|
| Max file size | **≤ 100 KB** |
| Preferred format | **WebP** (`.webp`) |
| Member card / car photo | **800×600** or **512×512** crop |
| Cover / hero (future) | **~1200px** wide |

**Tools:**

- [Squoosh](https://squoosh.app/) — WebP, quality slider
- **ImageMagick** — batch resize/compress
- **sharp** (Node) — optional future script in `scripts/optimize-images/`

### 4. Rename and place in the repo

Filenames must match **member id** in `public/data/clubs/wbn/wbn.json`:

```text
public/data/clubs/wbn/images/wbn-masy-m4.webp
```

JSON paths (no binary):

```json
"imageUrl": "/data/clubs/wbn/images/wbn-masy-m4.webp",
"avatarUrl": "/data/clubs/wbn/images/wbn-masy-m4.webp"
```

### 5. Verify locally

```bash
npm run check:wbn-images
npm run dev
```

Test: `/clubs/wbn`, `/members`, `/members/wbn-masy-m4`.

### 6. Production (later)

Upload optimized files to **Firebase Storage**. Set Firestore `imageUrl` and `avatarUrl` to public HTTPS URLs only.

## Local dev save mode

When Firebase is not configured, use the **Local image optimizer** on member pages in development (`npm run dev` only). The app compresses in the browser and writes the file via a dev-only API route.

1. Run `npm run dev`
2. Open `/members/wbn-bambam-84`
3. Select a large JPEG/PNG/WebP (up to 8 MB)
4. Review compact preview and size stats
5. Click **Save optimized image locally**
6. File is written to:

   ```text
   public/data/clubs/wbn/images/wbn-bambam-84.webp
   ```

7. Verify:

   ```bash
   npm run check:wbn-images
   ```

8. Refresh `/clubs/wbn` and `/members/wbn-bambam-84`

**Notes:**

- Only works when `NODE_ENV === "development"` (`POST /api/dev/save-member-image` returns 404 in production).
- Production will use **Firebase Storage** — do not rely on filesystem writes after deployment.
- Nothing is written to Firestore in local save mode.

## Local dev club cover save

On club pages in development (`/clubs/wbn`):

1. Expand **Club admin tools** at the bottom.
2. Under **Club cover image**, select a large JPEG/PNG/WebP.
3. Click **Save cover locally**.
4. File is written to:

   ```text
   public/data/clubs/wbn/cover.webp
   ```

5. Refresh `/clubs/wbn` — the cinematic hero cover updates.

API: `POST /api/dev/save-club-image` (development only, `imageKind=cover`, max **800 KB**).

**Optimization preset:** `club_cover` — max **1600px**, ~**0.45 MB** WebP target.

**Production (later):** Firebase Storage `club-images/{clubId}/cover.webp`; Firestore stores `coverImageUrl` / `imageUrl` only (no binary).

### Paths summary

| Asset | Local path |
|-------|------------|
| Member car photo | `public/data/clubs/{clubId}/images/{memberId}.webp` |
| Club cover | `public/data/clubs/{clubId}/cover.webp` |
| Club logo (future) | `public/data/clubs/{clubId}/logo.webp` |

## Local dev download mode (manual)

If you prefer a manual workflow, `ProfileImageUploader` still supports `mode="local-download"` (download only, no API write). Move the file into `public/data/clubs/{clubId}/images/` yourself.

## Admin manual member car photos

Signed-in **admins** can upload one car photo per member from **`/members/[id]`**:

1. Open a member profile (e.g. `/members/wbn-masy-m4`).
2. Use the **Admin image upload** panel (admin only).
3. Select a large JPEG/PNG/WebP (up to 8 MB raw).
4. Browser optimizes with **member_car** preset (max **1200px**, ~**0.22 MB** target).
5. Upload goes to Firebase Storage: `profile-images/member/{memberId}/profile.webp`
6. Firestore document **`club_members/{memberId}`** is created or updated with:
   - `avatarUrl`, `imageUrl`, `imageStoragePath`, `imageUpdatedAt`, `imageSizeBytes`, `imageContentType`
   - plus merged public member fields (club, car, Instagram handle, etc.)

**Local JSON seed members** (e.g. WBN in `public/data/clubs/wbn/wbn.json`) can be promoted to Firestore one at a time when you upload a photo. The UI notes when a member is still seed-only.

Member lists merge Firestore image URLs over local mock data so cards and maps show uploaded photos after refresh.

## User profile uploads (in-app)

Signed-in users can upload one profile/car photo from **`/profile`** (admins can update member photos on member detail pages).

1. User selects JPEG, PNG, or WebP (raw file up to **8 MB**).
2. **Browser** resizes/compresses via `browser-image-compression` (`lib/images/optimize-client-image.ts`):
   - max dimension **900px**
   - target about **180 KB** (typically lands near **100–200 KB**)
   - WebP when supported, else JPEG
3. Optimized file uploads to **Firebase Storage** at:
   - `profile-images/user/{uid}/profile.webp` (or `.jpg`)
   - `profile-images/member/{memberId}/profile.webp`
4. Firestore stores **metadata only** on `users/{uid}` or `club_members/{id}`:
   - `avatarUrl`, `imageUrl`, `imageStoragePath`, `imageUpdatedAt`, `imageSizeBytes`, `imageContentType`
5. Raw phone photos are **not** uploaded by default.

Requires `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` and Firebase Auth. No Vercel/server image processing yet.

### Future backend safety net

A Cloud Function could re-validate uploads with **sharp**, strip EXIF, enforce max dimensions, and reject oversized files. Client-side optimization remains the first line of defense.

## Firestore vs Storage

**Firestore documents:**

- `imageUrl`, `avatarUrl`, metadata (make, model, tags, etc.)

**Firebase Storage:** actual image bytes.

## Instagram

- `instagramHandle` (no `@`) and `instagram` as `https://instagram.com/{handle}`
- No scraping, no Instagram APIs for photos or profile data

## UI behavior

`MemberAvatar` and `MemberCarPhoto`:

- Show the image when the file loads
- Fade in on success (no layout jump; fixed min-height on card photos)
- On missing file or load error → gradient + initial (no broken-image icon)
- `alt` text: `@handle — Car Model`
