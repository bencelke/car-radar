import type { Club } from "@/lib/types";

/** Global admin or club owner/manager can manage club content. */
export function canManageClub(
  club: Club,
  uid: string | null | undefined,
  isGlobalAdmin: boolean
): boolean {
  if (!uid) return false;
  if (isGlobalAdmin) return true;
  if (club.ownerUid === uid) return true;
  if (club.adminUids?.includes(uid)) return true;
  if (club.managerUids?.includes(uid)) return true;
  return false;
}

export function clubFollowDocId(userId: string, clubId: string): string {
  return `${userId}_${clubId}`;
}

export function eventRsvpDocId(eventId: string, userId: string): string {
  return `${eventId}_${userId}`;
}

export function eventCheckInDocId(eventId: string, userId: string): string {
  return `${eventId}_${userId}`;
}

export function canManageEvent(
  event: { clubId?: string },
  club: Club | null | undefined,
  uid: string | null | undefined,
  isGlobalAdmin: boolean
): boolean {
  if (!uid) return false;
  if (isGlobalAdmin) return true;
  if (!event.clubId || !club) return false;
  return canManageClub(club, uid, false);
}
