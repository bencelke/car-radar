import type { UserProfile } from "@/lib/types";

export type UserAvatarSource = {
  firestoreAvatarUrl?: string | null;
  firestorePhotoURL?: string | null;
  authPhotoURL?: string | null;
  displayName?: string | null;
  email?: string | null;
};

export type AvatarSourceKind = "uploaded" | "provider" | "fallback";

function cleanUrl(value?: string | null): string | undefined {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") {
    return undefined;
  }
  return trimmed;
}

/** Resolved avatar URL or null when UI should show initials. */
export function getBestUserAvatarUrl(source: UserAvatarSource): string | null {
  return (
    cleanUrl(source.firestoreAvatarUrl) ??
    cleanUrl(source.firestorePhotoURL) ??
    cleanUrl(source.authPhotoURL) ??
    null
  );
}

export function getUserInitials(
  displayName?: string | null,
  email?: string | null
): string {
  const name = cleanUrl(displayName);
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  const local = email?.split("@")[0]?.trim();
  if (local) return local.slice(0, 2).toUpperCase();

  return "?";
}

export function avatarSourceFromProfile(
  profile: UserProfile | null | undefined,
  authUser?: { photoURL?: string | null; displayName?: string | null; email?: string | null } | null
): UserAvatarSource {
  return {
    firestoreAvatarUrl: profile?.avatarUrl ?? profile?.imageUrl,
    firestorePhotoURL: profile?.photoURL ?? profile?.providerPhotoUrl,
    authPhotoURL: authUser?.photoURL,
    displayName: profile?.displayName ?? authUser?.displayName,
    email: profile?.email ?? authUser?.email,
  };
}

export function getAvatarUrlFromProfile(
  profile: UserProfile | null | undefined,
  authUser?: { photoURL?: string | null; displayName?: string | null; email?: string | null } | null
): string | null {
  return getBestUserAvatarUrl(avatarSourceFromProfile(profile, authUser));
}

export function getInitialsFromProfile(
  profile: UserProfile | null | undefined,
  authUser?: { displayName?: string | null; email?: string | null } | null
): string {
  const source = avatarSourceFromProfile(profile, authUser);
  return getUserInitials(source.displayName, source.email);
}

/** Whether the user has a ShiftIt-uploaded avatar that can be removed. */
export function hasUploadedShiftItAvatar(
  profile: UserProfile | null | undefined
): boolean {
  if (!profile) return false;
  if (profile.avatarSource === "uploaded") return true;
  if (cleanUrl(profile.avatarStoragePath)) return true;
  const legacyPath = cleanUrl(profile.imageStoragePath);
  if (
    legacyPath &&
    (legacyPath.includes("/avatar/") || legacyPath.startsWith("profile-images/user/"))
  ) {
    return true;
  }
  return false;
}

export function hasProviderAccountPhoto(
  profile: UserProfile | null | undefined,
  authUser?: { photoURL?: string | null } | null
): boolean {
  return Boolean(
    cleanUrl(profile?.providerPhotoUrl) ??
      cleanUrl(profile?.photoURL) ??
      cleanUrl(authUser?.photoURL)
  );
}
