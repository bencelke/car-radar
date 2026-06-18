#!/usr/bin/env node
/**
 * Safe Firebase project alignment check — never prints secrets.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FIREBASE_ENV_KEYS,
  MAPBOX_ENV_KEY,
  getProjectId,
  loadLocalEnv,
  projectRoot,
} from "./shared-env.mjs";
import { EXPECTED_FIREBASE_PROJECT_ID } from "./firebase-project.mjs";

const OBSOLETE_PROJECT_ID = "shiftit-1f973";

const rulesPath = resolve(projectRoot, "firestore.rules");
const indexesPath = resolve(projectRoot, "firestore.indexes.json");
const storageRulesPath = resolve(projectRoot, "storage.rules");
const firebasercPath = resolve(projectRoot, ".firebaserc");
const firebaseJsonPath = resolve(projectRoot, "firebase.json");
const envLocalPath = resolve(projectRoot, ".env.local");

const SERVICE_ACCOUNT_CANDIDATES = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  resolve(projectRoot, "secrets", "firebase-service-account.json"),
  resolve(projectRoot, "serviceAccountKey.json"),
].filter(Boolean);

function readFirebasercProjectId() {
  if (!existsSync(firebasercPath)) return "";
  try {
    const rc = JSON.parse(readFileSync(firebasercPath, "utf8"));
    return rc?.projects?.default?.trim() ?? "";
  } catch {
    return "";
  }
}

function firebaseJsonReferencesStorage() {
  if (!existsSync(firebaseJsonPath)) return false;
  try {
    const config = JSON.parse(readFileSync(firebaseJsonPath, "utf8"));
    return Boolean(config?.storage?.rules);
  } catch {
    return false;
  }
}

function readServiceAccountProjectId() {
  for (const candidate of SERVICE_ACCOUNT_CANDIDATES) {
    const path = resolve(candidate);
    if (!existsSync(path)) continue;
    try {
      const json = JSON.parse(readFileSync(path, "utf8"));
      return {
        found: true,
        projectId: String(json.project_id ?? "").trim(),
      };
    } catch {
      return { found: true, projectId: "" };
    }
  }
  return { found: false, projectId: "" };
}

function envValueLooksLikeProject(value, projectId) {
  if (!value?.trim()) return null;
  return value.includes(projectId);
}

function countObsoleteProjectReferences() {
  let count = 0;
  for (const key of FIREBASE_ENV_KEYS) {
    const value = process.env[key]?.trim() ?? "";
    if (value.includes(OBSOLETE_PROJECT_ID)) count += 1;
  }
  if (readFirebasercProjectId() === OBSOLETE_PROJECT_ID) count += 1;
  return count;
}

function isMessagingSenderAligned() {
  const sender = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "";
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ?? "";
  if (!sender || !appId) return false;
  return appId.includes(`:${sender}:`);
}

loadLocalEnv(true);

const envProjectId = getProjectId();
const firebasercProjectId = readFirebasercProjectId();
const storageConfigured = firebaseJsonReferencesStorage();
const storageRulesFound = existsSync(storageRulesPath);
const rulesFound = existsSync(rulesPath);
const indexesFound = existsSync(indexesPath);
const envLocalExists = existsSync(envLocalPath);

const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "";

const missingEnvKeys = FIREBASE_ENV_KEYS.filter(
  (key) => !process.env[key]?.trim()
);
const mapboxPresent = Boolean(process.env[MAPBOX_ENV_KEY]?.trim());

const authDomainMatches = envValueLooksLikeProject(
  authDomain,
  EXPECTED_FIREBASE_PROJECT_ID
);
const storageBucketMatches = envValueLooksLikeProject(
  storageBucket,
  EXPECTED_FIREBASE_PROJECT_ID
);
const obsoleteRefs = countObsoleteProjectReferences();
const messagingAligned = isMessagingSenderAligned();

const serviceAccount = readServiceAccountProjectId();
const serviceAccountMatches =
  !serviceAccount.found ||
  (serviceAccount.projectId === EXPECTED_FIREBASE_PROJECT_ID &&
    serviceAccount.projectId !== "");

const projectIdsAligned =
  envProjectId === EXPECTED_FIREBASE_PROJECT_ID &&
  firebasercProjectId === EXPECTED_FIREBASE_PROJECT_ID &&
  envProjectId === firebasercProjectId;

const completeFirebaseConfig =
  missingEnvKeys.length === 0 &&
  projectIdsAligned &&
  authDomainMatches === true &&
  storageBucketMatches === true &&
  messagingAligned &&
  obsoleteRefs === 0 &&
  serviceAccountMatches;

const filesOk =
  rulesFound &&
  indexesFound &&
  (!storageConfigured || storageRulesFound);

const ok = completeFirebaseConfig && filesOk && envLocalExists;

console.log("\n[CarRadar] Firebase configuration check\n");
console.log(`.env.local found: ${envLocalExists ? "yes" : "no"}`);
console.log(`env project ID: ${envProjectId || "(missing)"}`);
console.log(`.firebaserc project ID: ${firebasercProjectId || "(missing)"}`);
console.log(`expected project ID: ${EXPECTED_FIREBASE_PROJECT_ID}`);
console.log(
  `project IDs match: ${
    envProjectId && firebasercProjectId && envProjectId === firebasercProjectId
      ? "yes"
      : "no"
  }`
);
console.log(
  `auth domain project match: ${
    authDomainMatches === true ? "yes" : authDomainMatches === false ? "no" : "unknown"
  }`
);
console.log(
  `storage bucket project match: ${
    storageBucketMatches === true
      ? "yes"
      : storageBucketMatches === false
        ? "no"
        : "unknown"
  }`
);
console.log(`messaging/app ID aligned: ${messagingAligned ? "yes" : "no"}`);
console.log(`complete Firebase config: ${completeFirebaseConfig ? "yes" : "no"}`);
console.log(`old project references: ${obsoleteRefs} active`);

if (missingEnvKeys.length > 0) {
  console.log(`missing env keys: ${missingEnvKeys.join(", ")}`);
} else {
  console.log("required Firebase env keys: all present");
}

console.log(`mapbox token present: ${mapboxPresent ? "yes" : "no"}`);
console.log(`rules file found: ${rulesFound ? "yes" : "no"}`);
console.log(`indexes file found: ${indexesFound ? "yes" : "no"}`);
console.log(
  `storage rules file found: ${storageRulesFound ? "yes" : storageConfigured ? "no" : "n/a"}`
);

if (serviceAccount.found) {
  console.log(
    `service account project matches: ${
      serviceAccount.projectId
        ? serviceAccount.projectId === EXPECTED_FIREBASE_PROJECT_ID
          ? "yes"
          : "no"
        : "unreadable"
    }`
  );
} else {
  console.log("service account file found: no (optional for web app)");
}

if (!completeFirebaseConfig) {
  console.log(
    "\n⚠  Firebase Web App configuration is incomplete or mixed across projects."
  );
  console.log(
    "Copy the complete config from Firebase Console → carradar-bd6fb"
  );
  console.log("→ Project settings → General → Your apps → Web app SDK.\n");
}

if (serviceAccount.found && !serviceAccountMatches) {
  console.log(
    "\n⚠  Local service account JSON does not belong to carradar-bd6fb."
  );
  console.log(
    "Download a new key from Firebase Console → carradar-bd6fb → Service accounts.\n"
  );
}

console.log(`\noverall: ${ok ? "OK" : "NEEDS ATTENTION"}\n`);
process.exit(ok ? 0 : 1);
