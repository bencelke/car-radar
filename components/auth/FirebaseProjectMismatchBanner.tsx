"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { useFirebaseConfigState } from "@/lib/hooks/useFirebaseConfigState";
import type { FirebaseConfigState, FirebaseProjectCheck } from "@/lib/firebase/project-check";

type FirebaseProjectDevDiagnosticsProps = {
  check: FirebaseProjectCheck;
  state: FirebaseConfigState;
};

export function FirebaseProjectDevDiagnostics({
  check,
  state,
}: FirebaseProjectDevDiagnosticsProps) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <details className="mt-4 rounded-lg border border-white/[0.06] bg-[#151B24]/40 px-3 py-2">
      <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
        Firebase project check (dev)
      </summary>
      <pre className="mt-2 overflow-x-auto border-t border-white/[0.04] pt-2 text-[10px] leading-relaxed text-[#94A3B8]">
        {`expected project: ${check.expectedProjectId}
env project: ${check.envProjectId ?? "(none)"}
initialized project: ${check.initializedProjectId ?? "(none)"}
state: ${state}
mismatch: ${String(check.isMismatch)}`}
      </pre>
    </details>
  );
}

function getMismatchConfiguredId(check: FirebaseProjectCheck): string {
  if (
    check.envProjectId &&
    check.envProjectId !== check.expectedProjectId
  ) {
    return check.envProjectId;
  }
  if (
    check.initializedProjectId &&
    check.initializedProjectId !== check.expectedProjectId
  ) {
    return check.initializedProjectId;
  }
  if (
    check.envProjectId &&
    check.initializedProjectId &&
    check.envProjectId !== check.initializedProjectId
  ) {
    return `${check.envProjectId} (env) / ${check.initializedProjectId} (app)`;
  }
  return check.envProjectId ?? check.initializedProjectId ?? "—";
}

export function FirebaseProjectMismatchBanner() {
  const { t } = useLocale();
  const { showMismatchWarning, check } = useFirebaseConfigState();

  if (!showMismatchWarning) {
    return null;
  }

  const configured = getMismatchConfiguredId(check);

  return (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-100/95"
    >
      <p className="font-semibold text-amber-50">
        {t.auth.firebaseProjectMismatchTitle}
      </p>
      <p className="mt-1">
        {t.auth.firebaseProjectMismatchBody
          .replace("{configured}", configured)
          .replace("{expected}", check.expectedProjectId)}
      </p>
      <p className="mt-2 text-[11px] text-amber-200/80">
        {t.auth.firebaseProjectMismatchHint}
      </p>
    </div>
  );
}
