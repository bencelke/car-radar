import type { FirebaseApp } from "firebase/app";

import { EXPECTED_FIREBASE_PROJECT_ID } from "@/lib/config/firebase-project";
import {
  getConfiguredFirebaseAuthDomain,
  getConfiguredFirebaseProjectId,
} from "@/lib/firebase/project";
import { isFirebaseEnvConsistent } from "@/lib/firebase/env-consistency";
import {
  getFirebaseConfigState,
  getFirebaseProjectCheck,
  isFirebaseProjectMismatch,
} from "@/lib/firebase/project-check";
import {
  isAuthAvailable,
  isFirebaseConfigured,
  isFirestoreAvailable,
  isStorageAvailable,
} from "@/lib/firebase/client";

export type FirebaseClientDiagnostics = {
  configured: boolean;
  projectId: string;
  initializedProjectId: string | null;
  authDomain: string;
  expectedProjectId: string;
  configState: ReturnType<typeof getFirebaseConfigState>;
  projectMismatch: boolean;
  configConsistent: boolean;
  authAvailable: boolean;
  firestoreAvailable: boolean;
  storageAvailable: boolean;
  hostname: string;
};

/** Safe client diagnostics — never includes API keys or tokens. */
export function getFirebaseClientDiagnostics(
  firebaseApp?: FirebaseApp | null
): FirebaseClientDiagnostics {
  const check = getFirebaseProjectCheck(firebaseApp);
  const configState = getFirebaseConfigState(check, isFirebaseConfigured);

  return {
    configured: isFirebaseConfigured,
    projectId: getConfiguredFirebaseProjectId(),
    initializedProjectId: check.initializedProjectId,
    authDomain: getConfiguredFirebaseAuthDomain(),
    expectedProjectId: EXPECTED_FIREBASE_PROJECT_ID,
    configState,
    projectMismatch: isFirebaseProjectMismatch(firebaseApp, isFirebaseConfigured),
    configConsistent: isFirebaseEnvConsistent(),
    authAvailable: isAuthAvailable,
    firestoreAvailable: isFirestoreAvailable,
    storageAvailable: isStorageAvailable,
    hostname:
      typeof window !== "undefined" ? window.location.hostname : "",
  };
}
