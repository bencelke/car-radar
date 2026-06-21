"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { canAccessAdmin, getUserDisplayTitle } from "@/lib/auth/permissions";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isProfileAdmin } from "@/lib/repositories/users";
import { getFirebaseClientDiagnostics } from "@/lib/firebase/diagnostics";
import {
  app,
  isAuthAvailable,
  isFirebaseConfigured,
  isFirestoreAvailable,
  isStorageAvailable,
} from "@/lib/firebase/client";
import { isFirebaseStorageConfigured } from "@/lib/firebase/storage";
import { cn } from "@/lib/utils";

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

type FirebaseDiagnosticsPanelProps = {
  expanded?: boolean;
  className?: string;
};

export function FirebaseDiagnosticsPanel({
  expanded = false,
  className,
}: FirebaseDiagnosticsPanelProps) {
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
  const profilePath = user?.uid ? `${COLLECTIONS.users}/${user.uid}` : "—";
  const resolvedAdmin = isDevAdminBypass || (Boolean(user) && isProfileAdmin(profile));
  const firebaseDiagnostics = getFirebaseClientDiagnostics(app);
  const mapboxPresent = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim());
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const envProjectPresent = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim()
  );
  const authDomainPresent = Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim()
  );

  const rows = (
    <div className="space-y-1">
      <StatusRow
        label={t.auth.diagnosticsFirebaseConfigured}
        value={isFirebaseConfigured ? yes : no}
      />
      <StatusRow
        label={t.auth.diagnosticsExpectedProjectId}
        value={firebaseDiagnostics.expectedProjectId}
      />
      <StatusRow
        label={t.admin.diagnosticsEnvProjectId}
        value={envProjectPresent ? yes : no}
      />
      <StatusRow
        label={t.admin.diagnosticsAuthDomainPresent}
        value={authDomainPresent ? yes : no}
      />
      <StatusRow
        label={t.auth.diagnosticsProjectId}
        value={firebaseDiagnostics.projectId || "—"}
      />
      <StatusRow
        label={t.admin.diagnosticsInitializedProjectId}
        value={firebaseDiagnostics.initializedProjectId || "—"}
      />
      <StatusRow
        label={t.admin.diagnosticsConfigState}
        value={firebaseDiagnostics.configState}
      />
      <StatusRow
        label={t.auth.diagnosticsProjectMatch}
        value={
          firebaseDiagnostics.configState === "ready"
            ? yes
            : firebaseDiagnostics.projectMismatch
              ? no
              : "—"
        }
      />
      <StatusRow
        label={t.auth.diagnosticsAuthDomain}
        value={firebaseDiagnostics.authDomain || "—"}
      />
      <StatusRow
        label={t.auth.diagnosticsFirestore}
        value={isFirestoreAvailable ? yes : no}
      />
      <StatusRow
        label={t.admin.diagnosticsStorageBucketPresent}
        value={storageBucket ? yes : no}
      />
      <StatusRow
        label={t.auth.diagnosticsStorage}
        value={
          isStorageAvailable && isFirebaseStorageConfigured() ? yes : no
        }
      />
      <StatusRow
        label={t.admin.diagnosticsMapboxPresent}
        value={mapboxPresent ? yes : no}
      />
      <StatusRow
        label={t.admin.diagnosticsAppEnvironment}
        value={process.env.NODE_ENV}
      />
      <StatusRow
        label={t.admin.diagnosticsBuildMode}
        value={process.env.NODE_ENV === "production" ? "production" : "development"}
      />
      <StatusRow
        label={t.auth.diagnosticsSignedIn}
        value={user?.email ?? "—"}
      />
      <StatusRow label={t.auth.diagnosticsUid} value={user?.uid ?? "—"} />
      <StatusRow
        label={t.auth.diagnosticsProfileLoaded}
        value={profileLoaded ? yes : no}
      />
      <StatusRow label={t.auth.diagnosticsProfilePath} value={profilePath} />
      {profile ? (
        <>
          <StatusRow label={t.auth.diagnosticsRole} value={profile.role ?? "—"} />
          <StatusRow
            label={t.admin.diagnosticsAdminRole}
            value={profile.adminRole ?? "—"}
          />
          <StatusRow
            label={t.admin.diagnosticsTitle}
            value={getUserDisplayTitle(profile) ?? profile.title ?? "—"}
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
        label={t.admin.diagnosticsCanAccessAdmin}
        value={
          loading || adminLoading
            ? "…"
            : canAccessAdmin(profile)
              ? yes
              : no
        }
      />
      <StatusRow
        label={t.auth.diagnosticsResolvedAdmin}
        value={
          loading || adminLoading ? "…" : resolvedAdmin ? yes : no
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
  );

  if (expanded) {
    return (
      <div
        className={cn(
          "rounded-xl border border-white/[0.06] bg-[#151B24]/50 p-4",
          className
        )}
      >
        {rows}
      </div>
    );
  }

  return (
    <div className={cn("mx-auto mb-4 max-w-[1920px] px-4 lg:px-6", className)}>
      <details className="rounded-lg border border-white/[0.06] bg-[#151B24]/50 px-3 py-2">
        <summary className="cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
          {t.auth.diagnosticsTitle}
        </summary>
        <div className="mt-2 border-t border-white/[0.04] pt-2">{rows}</div>
      </details>
    </div>
  );
}
