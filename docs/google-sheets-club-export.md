# Google Sheets club member export (CarRadar)

Bulk-export club members from a Google Sheet into structured data and car photos for CarRadar. This uses **Google Apps Script** inside your spreadsheet — not the Next.js app.

## Sheet format

Row 1 headers (exact spelling):

| Instagram | Car Model | Photo | Location |
|-----------|-----------|-------|----------|

Data starts on **row 2**. Example:

| `_bambam_84` | Audi RS6 | *(image)* | Wiesbaden, Germany |

- **Instagram** — handle or profile URL (stored as external link only; no scraping).
- **Car Model** — full car description from the sheet.
- **Photo** — in-cell image, over-grid image, `IMAGE("url")` formula, or a direct URL.
- **Location** — e.g. `Wiesbaden, Germany` → city + country.

## Install the script

1. Open your club Google Sheet.
2. **Extensions → Apps Script**.
3. Create a project (or use default).
4. Delete any sample code and paste the full contents of:
   - `scripts/google-sheets/export-club-members-appscript.js` (in this repo)
5. At the top of the file, set:
   ```javascript
   const CLUB_ID = "wbn";
   const CLUB_NAME = "WBN";
   ```
6. **Save** (disk icon).
7. Reload the spreadsheet tab.

Optional: for better **in-cell** image support, in Apps Script click **Services (+)** → add **Google Sheets API** → Enable, then set `USE_SHEETS_API = true` in the script.

## Run an export

1. Open the tab that contains your member rows.
2. Menu: **CarRadar Export → Export active sheet**.
3. First run: Google asks you to **authorize** (Drive, Spreadsheet, external URLs for `IMAGE()` / URL photos).
4. When finished, a dialog shows counts: rows, images exported, missing, errors.

### Images-only pass

**CarRadar Export → Export active sheet images only** — re-attempts photo extraction for rows without rewriting the full export sheet (lighter log output in the summary).

## Where files go

In Google Drive:

```
CarRadar Exports/
  {clubId}/                    e.g. wbn/
    images/
      wbn-bambam-84.png        (or .jpg / .webp from source)
    wbn-members-export.json
    wbn-members-export.csv
```

In the same spreadsheet, a tab:

```
export_{clubId}                e.g. export_wbn
```

Columns include: `id`, `clubId`, `displayName`, `instagramHandle`, `instagram`, `carName`, `carMake`, `carModel`, `city`, `country`, `imageFileName`, `imageDriveUrl`, `imageStatus`, `notes`.

## How image extraction works

For each row’s **Photo** column, the script tries (in order):

1. **In-cell image** (optional) — Google Sheets API if `USE_SHEETS_API` is enabled.
2. **Over-grid image** — image floating on the sheet but anchored to the Photo cell (`sheet.getImages()`).
3. **`IMAGE()` formula** — reads `=IMAGE("https://...")` and downloads the URL.
4. **Cell text** — plain `https://...` URL or a Google Drive file link.

If nothing works, the member row is still exported with `imageStatus: "missing"`.

Saved files are named `{memberId}.png` / `.jpg` / `.webp` based on the downloaded MIME type.

## Known limitations

- **Pasted images** in cells sometimes do not expose a downloadable blob or URL; those rows export as `missing`.
- **Over-grid images** may not support `getBlob()` in all Google Workspace versions.
- **Permissions** — the script must be allowed to create folders/files in your Drive.
- **Output format** — exports are often PNG/JPG from Sheets; they should be **optimized to WebP ≤100 KB** before production (see `scripts/optimize-images/README.md`).
- **Scale** — very large sheets may hit Apps Script runtime quotas; export in batches if needed.
- **Instagram** — only handle + URL are exported; no profile photos or metadata from Instagram.

## Recommended next steps

1. Download `CarRadar Exports/{clubId}/images/` from Drive.
2. Optimize each file (WebP, under 100 KB) — Squoosh, ImageMagick, or a future `sharp` script.
3. Rename to match CarRadar dev paths, e.g. `public/data/clubs/wbn/images/wbn-masy-m4.webp`.
4. Merge JSON fields into `public/data/clubs/wbn/wbn.json`, or use **Admin → Club import** in the app ([club-json-import.md](./club-json-import.md)) to generate/download JSON and save locally in dev.
5. Run locally: `npm run check:wbn-images`.
6. For production, upload images to **Firebase Storage** and set Firestore `imageUrl` / `avatarUrl` to HTTPS URLs only.

## Firestore rule

**Never store image binary in Firestore.** Documents store only:

- `imageUrl`
- `avatarUrl`
- metadata (make, model, tags, etc.)

Binary files live in Firebase Storage (or `public/` during local dev).

## Updating WBN profile images

Source sheet: [WBN Google Sheet](https://docs.google.com/spreadsheets/d/1egGQXYgWK8AvnhHWlqv_fKyih4EcegA19TFYvfaGuZE/edit?pli=1&gid=0#gid=0)

1. Open the Google Sheet.
2. **Extensions → Apps Script**.
3. Paste/run `scripts/google-sheets/export-club-members-appscript.js` from this repo (set `CLUB_ID = "wbn"`, `CLUB_NAME = "WBN"`).
4. **CarRadar Export → Export active sheet**.
5. Download exported images from Drive (`CarRadar Exports/wbn/images/`).
6. Optimize each photo to **WebP under 100 KB** (see [image-optimization.md](./image-optimization.md)).
7. Rename files to member IDs, e.g. `wbn-masy-m4.webp` (not the Instagram handle).
8. Place files in `public/data/clubs/wbn/images/` in the CarRadar repo.
9. Run:
   ```bash
   npm run check:wbn-images
   ```
10. Run:
    ```bash
    npm run dev
    ```
11. Test in the browser:
    - `/clubs/wbn`
    - `/members`
    - `/members/wbn-masy-m4`

Member JSON already points at `/data/clubs/wbn/images/{member-id}.webp` — you only need to add the image files; no Instagram scraping required.
