import { EXPECTED_FIREBASE_PROJECT_ID } from "@/lib/config/firebase-project";

const OBSOLETE_PROJECT_ID = "shiftit-1f973";

const FIREBASE_ENV_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
] as const;

/** Used by `npm run firebase:check` — not for login UI mismatch guard. */
export function envReferencesObsoleteProject(): boolean {
  return FIREBASE_ENV_KEYS.some((key) => {
    const value = process.env[key]?.trim() ?? "";
    return value.includes(OBSOLETE_PROJECT_ID);
  });
}

export function isAuthDomainAligned(
  projectId = EXPECTED_FIREBASE_PROJECT_ID
): boolean {
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
  if (!authDomain) return false;
  return authDomain.includes(projectId);
}

export function isStorageBucketAligned(
  projectId = EXPECTED_FIREBASE_PROJECT_ID
): boolean {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? "";
  if (!bucket) return false;
  return bucket.includes(projectId);
}

export function isMessagingSenderAligned(): boolean {
  const sender =
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? "";
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ?? "";
  if (!sender || !appId) return false;
  return appId.includes(`:${sender}:`);
}

export function isFirebaseEnvComplete(): boolean {
  return FIREBASE_ENV_KEYS.every((key) => Boolean(process.env[key]?.trim()));
}

/** Full env validation for CLI — separate from login project-ID guard. */
export function isFirebaseEnvConsistent(): boolean {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  if (projectId !== EXPECTED_FIREBASE_PROJECT_ID) return false;
  if (envReferencesObsoleteProject()) return false;
  if (!isAuthDomainAligned(projectId)) return false;
  if (!isStorageBucketAligned(projectId)) return false;
  if (!isMessagingSenderAligned()) return false;
  return isFirebaseEnvComplete();
}

export {
  EXPECTED_FIREBASE_PROJECT_ID,
  getConfiguredFirebaseAuthDomain,
  getConfiguredFirebaseProjectId,
} from "@/lib/firebase/project";
