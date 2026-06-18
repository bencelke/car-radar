export { EXPECTED_FIREBASE_PROJECT_ID } from "@/lib/config/firebase-project";

export function getConfiguredFirebaseProjectId(): string {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
}

export function getConfiguredFirebaseAuthDomain(): string {
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? "";
}
