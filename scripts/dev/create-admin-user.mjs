#!/usr/bin/env node
/**
 * Development only — creates Firebase Auth user + Firestore users/{uid} admin profile.
 * Requires Firebase Admin SDK service account (not the Web SDK config alone).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import admin from "firebase-admin";
import {
  FIREBASE_ENV_KEYS,
  loadLocalEnv,
  printFirebaseEnvStatus,
  assertNotProduction,
  getProjectId,
  projectRoot,
} from "./shared-env.mjs";

const DEV_EMAIL = "test@test.com";
const DEV_PASSWORD = "123456";
const DEV_DISPLAY_NAME = "Test Admin";

const SERVICE_ACCOUNT_PATHS = [
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  resolve(projectRoot, "secrets", "firebase-service-account.json"),
  resolve(projectRoot, "serviceAccountKey.json"),
].filter(Boolean);

assertNotProduction();

console.log("\n[CarRadar] Dev admin user setup\n");
console.warn(
  "⚠  This creates a DEV admin account (test@test.com). Change or delete it before production.\n"
);

const { envPath, loaded, missing } = loadLocalEnv(false);

if (!loaded) {
  console.error(`Missing ${envPath}`);
  console.error("Create .env.local from .env.example first.\n");
  process.exit(1);
}

const firebaseMissing = FIREBASE_ENV_KEYS.filter((key) =>
  missing.includes(key)
);
if (firebaseMissing.length > 0) {
  console.error("Missing Firebase env vars in .env.local:");
  for (const key of firebaseMissing) {
    console.error(`  - ${key}`);
  }
  process.exit(1);
}

const projectId = getProjectId();
if (!projectId) {
  console.error(
    "Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID (or FIREBASE_PROJECT_ID).\n"
  );
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
  console.error("Setup:");
  console.error("  1. Firebase Console → Project settings → Service accounts");
  console.error("  2. Generate new private key");
  console.error("  3. Save as: secrets/firebase-service-account.json");
  console.error("  4. Confirm secrets/ is in .gitignore");
  console.error(
    "  5. Or set GOOGLE_APPLICATION_CREDENTIALS=./secrets/firebase-service-account.json"
  );
  console.error("  6. Run: npm run dev:create-admin\n");
  console.error(
    "Why: Firestore cannot create email/password logins. Firebase Authentication requires the Admin SDK.\n"
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

const auth = admin.auth();
const db = admin.firestore();
const now = new Date().toISOString();

let uid;
let authAction;

try {
  try {
    const existing = await auth.getUserByEmail(DEV_EMAIL);
    uid = existing.uid;
    await auth.updateUser(uid, {
      password: DEV_PASSWORD,
      emailVerified: true,
      displayName: DEV_DISPLAY_NAME,
    });
    authAction = "Updated existing Firebase Auth user";
  } catch (err) {
    if (err?.code === "auth/user-not-found") {
      const created = await auth.createUser({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
        emailVerified: true,
        displayName: DEV_DISPLAY_NAME,
      });
      uid = created.uid;
      authAction = "Created Firebase Auth user";
    } else {
      throw err;
    }
  }

  const userRef = db.collection("users").doc(uid);
  const snap = await userRef.get();
  const existing = snap.exists ? snap.data() : {};

  await userRef.set(
    {
      uid,
      email: DEV_EMAIL,
      displayName: DEV_DISPLAY_NAME,
      role: "admin",
      isAdmin: true,
      createdAt: existing.createdAt ?? now,
      updatedAt: now,
      lastLoginAt: existing.lastLoginAt ?? null,
    },
    { merge: true }
  );

  console.log(authAction);
  console.log("Created/updated Firestore admin profile (users/{uid})");
  console.log(`UID: ${uid}`);
  console.log(`Email: ${DEV_EMAIL}`);
  console.log("\nSign in at: http://localhost:3000/admin");
  console.log(
    "\nDev login (local only — do not use in production): test@test.com / 123456\n"
  );
  process.exit(0);
} catch (err) {
  console.error("\nFailed to create admin user.\n");
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error(String(err));
  }
  process.exit(1);
}
