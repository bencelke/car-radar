"use client";

import { useEffect, useMemo } from "react";

import {
  type FirebaseConfigState,
  type FirebaseProjectCheck,
  getFirebaseConfigState,
  getFirebaseProjectCheck,
} from "@/lib/firebase/project-check";
import { app, isFirebaseConfigured } from "@/lib/firebase/client";

export type FirebaseConfigDiagnostics = {
  state: FirebaseConfigState;
  check: FirebaseProjectCheck;
  authBlocked: boolean;
  showMismatchWarning: boolean;
};

export function useFirebaseConfigState(): FirebaseConfigDiagnostics {
  const diagnostics = useMemo(() => {
    const check = getFirebaseProjectCheck(app);
    const state = getFirebaseConfigState(check, isFirebaseConfigured);
    return {
      state,
      check,
      authBlocked: state === "mismatch" || state === "missing",
      showMismatchWarning: state === "mismatch",
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const { check, state } = diagnostics;
    console.info("[CarRadar] Firebase project check", {
      expectedProject: check.expectedProjectId,
      envProject: check.envProjectId ?? "(none)",
      initializedProject: check.initializedProjectId ?? "(none)",
      state,
      mismatch: check.isMismatch,
    });
  }, [diagnostics]);

  return diagnostics;
}
