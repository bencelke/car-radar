"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { useFirebaseConfigState } from "@/lib/hooks/useFirebaseConfigState";

export function FirebaseProjectMismatchBanner() {
  const { t } = useLocale();
  const { showMismatchWarning } = useFirebaseConfigState();

  if (!showMismatchWarning) {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100/95"
    >
      {t.auth.authConfigInvalid}
    </div>
  );
}
