# Local image optimization (placeholder)

Use this after exporting photos from Google Sheets (`docs/google-sheets-club-export.md`) and before adding them to CarRadar.

## Targets

| Use | Guideline |
|-----|-----------|
| Member card / avatar | **512×512** or **800×600** (crop to car) |
| Max file size | **≤ 100 KB** |
| Format | **WebP** preferred (`.jpg` acceptable) |
| Cover / hero (future) | ~**1200px** wide |

## Tools (manual for now)

- [Squoosh](https://squoosh.app/) — drag-and-drop, WebP, quality slider
- **ImageMagick** — batch resize/compress from terminal
- **sharp** (Node) — not wired in this repo yet; add a script here when `sharp` is a project dependency

## CarRadar paths (dev)

Place optimized files under:

```text
public/data/clubs/{clubId}/images/{member-id}.webp
```

Example: `public/data/clubs/wbn/images/wbn-masy-m4.webp`

Verify:

```bash
npm run check:wbn-images
```

## Production

Upload optimized files to **Firebase Storage**, then set `imageUrl` and `avatarUrl` on `club_members` documents to the public download URLs — not base64, not Firestore blobs.
