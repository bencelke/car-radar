import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const projectRoot = resolve(__dirname, "../..");

export const FIREBASE_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

export const MAPBOX_ENV_KEY = "NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN";

/** @param {boolean} [optionalMapbox] */
export function loadLocalEnv(optionalMapbox = false) {
  const envPath = resolve(projectRoot, ".env.local");
  if (!existsSync(envPath)) {
    return { envPath, loaded: false, missing: [...FIREBASE_ENV_KEYS] };
  }

  dotenv.config({ path: envPath, override: true });

  const keys = optionalMapbox
    ? [...FIREBASE_ENV_KEYS, MAPBOX_ENV_KEY]
    : FIREBASE_ENV_KEYS;

  const missing = keys.filter((key) => !process.env[key]?.trim());

  return { envPath, loaded: true, missing };
}

export function getProjectId() {
  return (
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    ""
  );
}

export function printFirebaseEnvStatus() {
  const projectId = getProjectId();
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();

  console.log(
    `Firebase project id detected: ${projectId ? "yes" : "no"}`
  );
  console.log(`Auth domain detected: ${authDomain ? "yes" : "no"}`);
  if (projectId) {
    console.log(`Firestore target project: ${projectId}`);
  }
}

export function assertNotProduction() {
  if (process.env.NODE_ENV === "production") {
    console.error(
      "\n[CarRadar] Refused: this script must not run with NODE_ENV=production.\n"
    );
    process.exit(1);
  }
}
