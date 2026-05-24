# Club JSON import (Admin wizard)

Use **Admin → Club import** to create a car club and its members from CSV or a public Google Sheets CSV export.

## Workflow

1. Open `/admin` → **Club import** tab.
2. Fill **Club details** (ID, name, city, area, country, description, tags).
3. Provide member data:
   - **Paste CSV** — copy from Google Sheets (*File → Download → CSV*)
   - **Upload CSV** — `.csv` file from disk
   - **Google Sheets CSV link** — public sheet only; edit URLs are converted to `export?format=csv`
4. Click **Preview members** — review handles, car models, member IDs, image paths, validation.
5. Export or save:
   - **Download club JSON** — `{clubId}.json` with `{ club, members }`
   - **Download normalized CSV** — member fields for spreadsheets
   - **Import into local session** — club + members appear on `/clubs` and `/members` until dev server restart
   - **Save club JSON locally** (dev only) — writes to disk via `POST /api/dev/save-club-json`

## Expected CSV columns

Row 1 headers (case-insensitive aliases supported):

| Column | Aliases |
|--------|---------|
| Instagram | `instagram`, `instagram handle`, `handle`, `ig` |
| Car Model | `car model`, `car`, `vehicle`, `model` |
| Photo | `photo`, `image`, `image url`, `car photo` |
| Location | `location`, `city`, `area` |

Example:

```csv
Instagram,Car Model,Photo,Location
_bambam_84,Audi RS6,,Wiesbaden, Germany
```

## Local file layout

After download or dev save:

```text
public/data/clubs/{clubId}/
  {clubId}.json
  cover.webp          (optional — upload via club admin tools)
  images/
    {memberId}.webp   (one per member — optimize separately)
```

Member IDs: `{clubId}-{slugified-instagram-handle}` (e.g. `wbn-bambam-84`).

Image URLs in JSON point to `/data/clubs/{clubId}/images/{memberId}.webp` unless the Photo column contains a full `http(s)` URL.

## Wire into seeds (persistent)

Like WBN, import the JSON in `lib/mock-data/seeds.ts`:

```ts
import testClubSeed from "../../public/data/clubs/test-club/test-club.json";
// add club to mockClubs, members to mockClubMembers
```

Or use **Import into local session** for quick testing without editing seeds.

## Firebase (later)

Firestore import from the wizard is **not** implemented yet. When Firebase is configured, club/member documents will use the same JSON shape; images stay in Storage paths only.

## Dev API

`POST /api/dev/save-club-json` (development only)

```json
{
  "clubId": "test-club",
  "bundle": { "club": { ... }, "members": [ ... ] }
}
```

Validates `clubId` (safe slug) and writes `public/data/clubs/{clubId}/{clubId}.json` plus `images/.gitkeep`.

## Images

CSV does **not** export embedded Google Sheets images. Use:

- `docs/google-sheets-club-export.md` — Apps Script bulk image export
- Club/member **admin image tools** on `/clubs/{slug}` and `/members/{id}` for local `.webp` saves
