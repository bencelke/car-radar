import type { ShiftItUserProfile } from "@/lib/types/user";
import { SHIFTIT_FOUNDERS } from "@/lib/config/admins";
import type { UserProfile } from "@/lib/types";

function asShiftItProfile(
  profile: UserProfile | null | undefined
): ShiftItUserProfile | null | undefined {
  if (!profile) return profile;
  return profile as ShiftItUserProfile;
}

export function isFounderUser(
  userProfile: UserProfile | null | undefined
): boolean {
  const profile = asShiftItProfile(userProfile);
  if (!profile) return false;
  return (
    profile.role === "founder" || profile.adminRole === "founder"
  );
}

export function isAdminUser(
  userProfile: UserProfile | null | undefined
): boolean {
  const profile = asShiftItProfile(userProfile);
  if (!profile) return false;
  return (
    profile.isAdmin === true ||
    profile.role === "admin" ||
    profile.role === "founder" ||
    profile.adminRole === "founder" ||
    profile.adminRole === "admin"
  );
}

export function canAccessAdmin(
  userProfile: UserProfile | null | undefined
): boolean {
  return isAdminUser(userProfile);
}

export function getUserDisplayTitle(
  userProfile: UserProfile | null | undefined
): string | null {
  const profile = asShiftItProfile(userProfile);
  if (profile?.title?.trim()) return profile.title.trim();

  const uid = profile?.uid;
  if (uid && uid in SHIFTIT_FOUNDERS) {
    return SHIFTIT_FOUNDERS[uid as keyof typeof SHIFTIT_FOUNDERS].title;
  }

  return null;
}

export function getAdminNavLabelKey(
  userProfile: UserProfile | null | undefined
): "founderConsole" | "adminAccess" {
  return isFounderUser(userProfile) ? "founderConsole" : "adminAccess";
}
