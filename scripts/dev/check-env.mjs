#!/usr/bin/env node
/**
 * Development only — checks .env.local for required variables (no secret values printed).
 */
import {
  FIREBASE_ENV_KEYS,
  MAPBOX_ENV_KEY,
  loadLocalEnv,
  printFirebaseEnvStatus,
  assertNotProduction,
} from "./shared-env.mjs";

assertNotProduction();

const { envPath, loaded, missing } = loadLocalEnv(true);

console.log("\n[CarRadar] Environment check (dev)\n");

if (!loaded) {
  console.error(`Missing file: ${envPath}`);
  console.error("Create .env.local from .env.example and add your Firebase Web SDK values.\n");
  process.exit(1);
}

console.log(`Loaded: ${envPath}\n`);

const firebaseMissing = FIREBASE_ENV_KEYS.filter((key) =>
  missing.includes(key)
);
const mapboxMissing = missing.includes(MAPBOX_ENV_KEY);

if (firebaseMissing.length > 0) {
  console.log("Missing Firebase variables:");
  for (const key of firebaseMissing) {
    console.log(`  - ${key}`);
  }
  console.log("");
} else {
  printFirebaseEnvStatus();
  console.log("\nAll required Firebase variables are set.");
}

if (mapboxMissing) {
  console.log(`\nOptional missing: ${MAPBOX_ENV_KEY} (/map will use fallback)`);
} else {
  console.log("\nMapbox token: present");
}

if (firebaseMissing.length > 0) {
  console.log("\nFix .env.local, then run: npm run dev:check-env\n");
  process.exit(1);
}

console.log("\nOK — ready for Firebase client mode.\n");
process.exit(0);
