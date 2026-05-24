"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { isProfileAdmin } from "@/lib/repositories/users";
import {
  isAuthAvailable,
  isFirebaseConfigured,
  isFirestoreAvailable,
  isStorageAvailable,
} from "@/lib/firebase/client";
import { isFirebaseStorageConfigured } from "@/lib/firebase/storage";

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-[11px]">
      <span className="shrink-0 text-[#64748B]">{label}</span>
      <span className="max-w-[65%] truncate text-right font-medium text-[#E2E8F0]">
        {value}
      </span>
    </div>
  );
}

export function FirebaseDiagnosticsPanel() {
  const { t } = useLocale();
  const {
    user,
    profile,
    profileError,
    isAdmin,
    isDevAdminBypass,
    loading,
    adminLoading,
  } = useAuth();

  const showInDev = process.env.NODE_ENV === "development";
  if (!showInDev && !isAdmin) return null;

  const yes = t.auth.diagnosticsYes;
  const no = t.auth.diagnosticsNo;
  const firestoreImportEnabled =
    isFirebaseConfigured && isFirestoreAvailable && isAdmin && !isDevAdminBypass;
  const profileLoaded = Boolean(profile);
  const resolvedAdmin = isDevAdminBypass || (Boolean(user) && isProfileAdmin(profile));

  return (
    <div className="mx-auto mb-4 max-w-[1920px] px-4 lg:px-6">
      <details className="rounded-lg border border-white/[0.06] bg-[#151B24]/50 px-3 py-2">
        <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
          {t.auth.diagnosticsTitle}
        </summary>
        <div className="mt-2 space-y-1 border-t border-white/[0.04] pt-2">
          <StatusRow
            label={t.auth.diagnosticsFirebaseConfigured}
            value={isFirebaseConfigured ? yes : no}
          />
          <StatusRow
            label={t.auth.diagnosticsAuth}
            value={isAuthAvailable ? yes : no}
          />
          <StatusRow
            label={t.auth.diagnosticsFirestore}
            value={isFirestoreAvailable ? yes : no}
          />
          <StatusRow
            label={t.auth.diagnosticsStorage}
            value={
              isStorageAvailable && isFirebaseStorageConfigured() ? yes : no
            }
          />
          <StatusRow
            label={t.auth.diagnosticsSignedIn}
            value={user?.email ?? "—"}
          />
          <StatusRow
            label={t.auth.diagnosticsUid}
            value={user?.uid ?? "—"}
          />
          <StatusRow
            label={t.auth.diagnosticsProfileLoaded}
            value={profileLoaded ? yes : no}
          />
          {profile ? (
            <>
              <StatusRow
                label={t.auth.diagnosticsRole}
                value={profile.role ?? "—"}
              />
              <StatusRow
                label={t.auth.diagnosticsIsAdmin}
                value={
                  profile.isAdmin === true
                    ? yes
                    : profile.isAdmin === false
                      ? no
                      : "—"
                }
              />
            </>
          ) : null}
          <StatusRow
            label={t.auth.diagnosticsResolvedAdmin}
            value={
              loading || adminLoading
                ? "…"
                : resolvedAdmin
                  ? yes
                  : no
            }
          />
          <StatusRow
            label={t.auth.diagnosticsAdmin}
            value={
              loading || adminLoading
                ? "…"
                : isDevAdminBypass
                  ? `${yes} (${t.auth.developmentMode})`
                  : isAdmin
                    ? yes
                    : no
            }
          />
          <StatusRow
            label={t.auth.diagnosticsFirestoreImport}
            value={firestoreImportEnabled ? yes : no}
          />
          {profileError ? (
            <p className="pt-1 text-[10px] leading-relaxed text-red-300/90">
              {t.auth.diagnosticsProfileError}: {profileError}
            </p>
          ) : null}
        </div>
      </details>
    </div>
  );
}
