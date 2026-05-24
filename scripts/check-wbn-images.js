/**
 * Verifies WBN member image files exist under public/ for local dev.
 * Missing images are OK — exit code is always 0.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const jsonPath = path.join(root, "public", "data", "clubs", "wbn", "wbn.json");
const imagesDir = path.join(root, "public", "data", "clubs", "wbn", "images");

const EXPECTED_WEBP = (id) => `/data/clubs/wbn/images/${id}.webp`;

function publicPathFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const rel = url.startsWith("/") ? url.slice(1) : url;
  return path.join(root, "public", rel);
}

function basenameFromUrl(url) {
  if (!url) return null;
  const parts = url.split("/");
  return parts[parts.length - 1] || null;
}

function main() {
  if (!fs.existsSync(jsonPath)) {
    console.error(`[check:wbn-images] Missing ${jsonPath}`);
    process.exit(0);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const members = data.members ?? [];
  const found = [];
  const missing = [];
  const pathMismatches = [];

  for (const member of members) {
    const expectedUrl = EXPECTED_WEBP(member.id);
    const imageUrl = member.imageUrl ?? "";
    const avatarUrl = member.avatarUrl ?? "";

    if (imageUrl !== expectedUrl || avatarUrl !== expectedUrl) {
      pathMismatches.push({
        id: member.id,
        imageUrl,
        avatarUrl,
        expected: expectedUrl,
      });
    }

    const imagePath = publicPathFromUrl(member.imageUrl ?? member.avatarUrl);
    if (!imagePath) {
      missing.push({
        id: member.id,
        filename: `${member.id}.webp`,
        reason: "no imageUrl in JSON",
      });
      continue;
    }

    if (fs.existsSync(imagePath)) {
      const stat = fs.statSync(imagePath);
      found.push({
        id: member.id,
        filename: basenameFromUrl(member.imageUrl) || `${member.id}.webp`,
        file: path.relative(root, imagePath),
        sizeKb: Math.round(stat.size / 1024),
      });
    } else {
      missing.push({
        id: member.id,
        filename: basenameFromUrl(member.imageUrl) || `${member.id}.webp`,
        file: path.relative(root, imagePath),
      });
    }
  }

  const total = members.length;
  const percent =
    total > 0 ? Math.round((found.length / total) * 100) : 0;

  console.log("WBN member images check\n");
  console.log(`JSON: ${path.relative(root, jsonPath)}`);
  console.log(`Images folder: ${path.relative(root, imagesDir)}`);
  console.log(`Total members: ${total}`);
  console.log(`Found: ${found.length}`);
  console.log(`Missing: ${missing.length}`);
  console.log(`Complete: ${percent}%\n`);

  if (pathMismatches.length > 0) {
    console.log("Path convention warnings (expected /data/clubs/wbn/images/{id}.webp):");
    for (const row of pathMismatches) {
      console.log(`  ! ${row.id}`);
      console.log(`      imageUrl:  ${row.imageUrl || "(empty)"}`);
      console.log(`      avatarUrl: ${row.avatarUrl || "(empty)"}`);
      console.log(`      expected:  ${row.expected}`);
    }
    console.log("");
  }

  if (found.length > 0) {
    console.log("Found:");
    for (const row of found) {
      console.log(`  ✓ ${row.filename || row.file} (${row.id}, ~${row.sizeKb} KB)`);
    }
    console.log("");
  }

  if (missing.length > 0) {
    console.log("Missing filenames (gradient fallback in UI):");
    for (const row of missing) {
      console.log(`  ✗ ${row.filename}${row.file ? `  →  ${row.file}` : ""}${row.reason ? `  (${row.reason})` : ""}`);
    }
    console.log("");
  }

  console.log("Place optimized .webp files in public/data/clubs/wbn/images/");
  console.log("See public/data/clubs/wbn/images/README.md and docs/image-optimization.md");
  process.exit(0);
}

main();
