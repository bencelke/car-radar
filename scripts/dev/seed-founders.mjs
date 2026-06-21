#!/usr/bin/env node
/**
 * Upserts ShiftIt founder profiles in Firestore (carradar-bd6fb).
 * Requires Firebase Admin SDK service account — not the Web SDK config alone.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import admin from "firebase-admin";
import {
  assertNotProduction,
  getProjectId,
  loadLocalEnv,
  printFirebaseEnvStatus,
  projectRoot,
} from "./shared-env.mjs";

const SHIFTIT_FOUNDER_UIDS = [
  "l3LCkOap3LOEgUqDKlIJ7GogG442",
  "UZApYWbHw8UjK5DPYxfMczAxoUH2",
];

const SHIFTIT_FOUNDERS = {
  l3LCkOap3LOEgUqDKlIJ7GogG442: { title: "Founder", adminRole: "founder" },
  UZApYWbHw8UjK5DPYxfMczAxoUH2: {
    title: "Co-Founder",
    adminRole: "founder",
  },
};

const SERVICE_ACCOUNT_PATHS = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  resolve(projectRoot, "secrets", "firebase-service-account.json"),
  resolve(projectRoot, "serviceAccountKey.json"),
].filter(Boolean);

assertNotProduction();

console.log("\n[ShiftIt] Founder profile seed\n");

const { envPath, loaded } = loadLocalEnv(false);
if (!loaded) {
  console.error(`Missing ${envPath}. Create .env.local from .env.example first.\n`);
  process.exit(1);
}

const projectId = getProjectId();
if (!projectId) {
  console.error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID.\n");
  process.exit(1);
}

printFirebaseEnvStatus();
console.log("");

function resolveServiceAccount() {
  for (const candidate of SERVICE_ACCOUNT_PATHS) {
    const path = resolve(candidate);
    if (existsSync(path)) {
      return { path, credential: JSON.parse(readFileSync(path, "utf8")) };
    }
  }
  return null;
}

const serviceAccount = resolveServiceAccount();
if (!serviceAccount) {
  console.error("No Firebase service account JSON found.\n");
  console.error("Manual fallback — Firebase Console → Firestore → users/{uid}:");
  for (const uid of SHIFTIT_FOUNDER_UIDS) {
    const meta = SHIFTIT_FOUNDERS[uid];
    console.error(`  users/${uid}`);
    console.error(
      JSON.stringify(
        {
          uid,
          role: "founder",
          isAdmin: true,
          adminRole: meta.adminRole,
          title: meta.title,
        },
        null,
        2
      )
    );
    console.error("");
  }
  console.error(
    "Or save service account to secrets/firebase-service-account.json and re-run: npm run seed:founders\n"
  );
  process.exit(1);
}

console.log(`Service account loaded from: ${serviceAccount.path}\n`);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount.credential),
    projectId,
  });
}

const db = admin.firestore();
const now = new Date().toISOString();

for (const uid of SHIFTIT_FOUNDER_UIDS) {
  const meta = SHIFTIT_FOUNDERS[uid];
  const userRef = db.collection("users").doc(uid);
  const snap = await userRef.get();
  const existing = snap.exists ? snap.data() : {};

  await userRef.set(
    {
      uid,
      email: existing.email ?? null,
      displayName: existing.displayName ?? null,
      photoURL: existing.photoURL ?? null,
      role: "founder",
      isAdmin: true,
      adminRole: meta.adminRole,
      title: meta.title,
      createdAt: existing.createdAt ?? now,
      updatedAt: now,
    },
    { merge: true }
  );

  console.log(`Upserted founder profile: users/${uid} (${meta.title})`);
}

console.log("\nDone. Sign in and open /admin to verify founder access.\n");
process.exit(0);
