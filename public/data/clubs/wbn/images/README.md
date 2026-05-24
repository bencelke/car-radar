# WBN member car images (local dev)

Place **optimized** car photos here. Filenames must match member `id` in `../wbn.json`.

## Required filenames

- `wbn-bambam-84.webp`
- `wbn-die-bimmerboys.webp`
- `wbn-pecke-r56.webp`
- `wbn-her-rallyeredfk8.webp`
- `wbn-larissa-s5.webp`
- `wbn-masy-m4.webp`
- `wbn-pod-racer.webp`
- `wbn-smoked-m4.webp`
- `wbn-stefan-m346.webp`
- `wbn-ugurcan-m4.webp`
- `wbn-unbegrenzt335.webp`

## Guidelines

- **Format:** WebP preferred (`.webp`)
- **Size:** under **100 KB** per file when possible
- **Dimensions:** ~800×600 or 512×512 crop (see `docs/image-optimization.md`)
- **Do not** commit huge raw exports from Google Drive — resize/compress first
- **Do not** store image binary in `wbn.json` or Firestore — only paths/URLs

## Missing files

If a file is not present, the app shows a **gradient + initial** placeholder (no broken-image icon).

## Check status

From the repo root:

```bash
npm run check:wbn-images
```

## Source workflow

1. Export from the [WBN Google Sheet](https://docs.google.com/spreadsheets/d/1egGQXYgWK8AvnhHWlqv_fKyih4EcegA19TFYvfaGuZE/edit) via Apps Script (`docs/google-sheets-club-export.md`).
2. Download images from Drive, optimize, rename to the filenames above.
3. Copy into this folder and run `npm run check:wbn-images`.

Production: upload to Firebase Storage and set `imageUrl` / `avatarUrl` to HTTPS URLs.
