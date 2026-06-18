import type { FirebaseApp } from "firebase/app";

import { EXPECTED_FIREBASE_PROJECT_ID } from "@/lib/config/firebase-project";

export type FirebaseConfigState = "loading" | "missing" | "mismatch" | "ready";

export type FirebaseProjectCheck = {
  expectedProjectId: string;
  envProjectId: string | null;
  initializedProjectId: string | null;
  isConfigured: boolean;
  isMismatch: boolean;
};

function trimOrNull(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Pure project-ID comparison — does not validate auth domain or bucket. */
export function evaluateFirebaseProjectCheck(
  expected: string,
  envProjectId: string | null,
  initializedProjectId: string | null
): FirebaseProjectCheck {
  const isMismatch =
    (envProjectId !== null && envProjectId !== expected) ||
    (initializedProjectId !== null && initializedProjectId !== expected) ||
    (envProjectId !== null &&
      initializedProjectId !== null &&
      envProjectId !== initializedProjectId);

  const isConfigured = Boolean(envProjectId) && Boolean(initializedProjectId);

  return {
    expectedProjectId: expected,
    envProjectId,
    initializedProjectId,
    isConfigured,
    isMismatch,
  };
}

export function getFirebaseProjectCheck(
  firebaseApp: FirebaseApp | null | undefined,
  expected = EXPECTED_FIREBASE_PROJECT_ID
): FirebaseProjectCheck {
  const envProjectId = trimOrNull(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const initializedProjectId = trimOrNull(firebaseApp?.options?.projectId);

  return evaluateFirebaseProjectCheck(
    expected,
    envProjectId,
    initializedProjectId
  );
}

export function getFirebaseConfigState(
  check: FirebaseProjectCheck,
  hasRequiredEnv: boolean
): FirebaseConfigState {
  if (!hasRequiredEnv && !check.envProjectId) {
    return "missing";
  }

  if (hasRequiredEnv && !check.initializedProjectId) {
    return "missing";
  }

  if (!check.envProjectId) {
    return "missing";
  }

  if (!check.initializedProjectId) {
    return "loading";
  }

  if (check.isMismatch) {
    return "mismatch";
  }

  return "ready";
}

export function isFirebaseProjectMismatch(
  firebaseApp: FirebaseApp | null | undefined,
  hasRequiredEnv: boolean
): boolean {
  const check = getFirebaseProjectCheck(firebaseApp);
  const state = getFirebaseConfigState(check, hasRequiredEnv);
  return state === "mismatch";
}
