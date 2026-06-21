export type DisplayNameSource = {
  firestoreDisplayName?: string | null;
  firestorePublicName?: string | null;
  authDisplayName?: string | null;
  email?: string | null;
};

const FALLBACK_DISPLAY_NAME = "ShiftIt user";

function cleanName(value?: string | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") {
    return undefined;
  }
  return trimmed;
}

function emailUsername(email?: string | null): string | undefined {
  const cleaned = cleanName(email);
  if (!cleaned || !cleaned.includes("@")) return undefined;
  const local = cleaned.split("@")[0]?.trim();
  return local || undefined;
}

/** Single source of truth for how account names appear in the UI. */
export function getBestUserDisplayName(source: DisplayNameSource): string {
  return (
    cleanName(source.firestorePublicName) ??
    cleanName(source.firestoreDisplayName) ??
    cleanName(source.authDisplayName) ??
    emailUsername(source.email) ??
    FALLBACK_DISPLAY_NAME
  );
}

export function displayNameFromUserLike(
  profile?: {
    displayName?: string | null;
    publicName?: string | null;
    email?: string | null;
  } | null,
  authUser?: { displayName?: string | null; email?: string | null } | null
): string {
  return getBestUserDisplayName({
    firestorePublicName: profile?.publicName,
    firestoreDisplayName: profile?.displayName,
    authDisplayName: authUser?.displayName,
    email: profile?.email ?? authUser?.email,
  });
}
