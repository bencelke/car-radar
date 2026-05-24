/**
 * One-off / repeatable brand asset optimization.
 * Source: Logo/shiftit-dark.png → public/brand/
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const src = path.join(root, "public/brand/shiftit-dark.png");
const outDir = path.join(root, "public/brand");

await mkdir(outDir, { recursive: true });

await sharp(src)
  .resize(1100, null, { withoutEnlargement: true, fit: "inside" })
  .webp({ quality: 86 })
  .toFile(path.join(outDir, "shiftit-logo.webp"));

await sharp(src)
  .resize(220, null, { withoutEnlargement: true, fit: "inside" })
  .webp({ quality: 84 })
  .toFile(path.join(outDir, "shiftit-logo-small.webp"));

console.log("[CarRadar] Brand WebP assets written to public/brand/");
