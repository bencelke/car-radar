import { canManageClub, canManageEvent } from "@/lib/clubs/club-auth";
import { resolveClubPostAccess } from "@/lib/community/can-post-to-club";
import type {
  CarEvent,
  Club,
  ClubMember,
  PostContextType,
  PostType,
} from "@/lib/types";

export const CLUB_MEMBER_POST_TYPES: PostType[] = [
  "discussion",
  "question",
  "car_update",
  "meet_photo",
];

export const CLUB_OFFICIAL_POST_TYPES: PostType[] = [
  "club_news",
  "announcement",
  "route_update",
  "event_update",
];

export const EVENT_MEMBER_POST_TYPES: PostType[] = [
  "discussion",
  "question",
  "meet_photo",
];

export const EVENT_OFFICIAL_POST_TYPES: PostType[] = [
  "event_update",
  "route_update",
  "announcement",
];

export const OFFICIAL_POST_TYPES: PostType[] = [
  "club_news",
  "event_update",
  "route_update",
  "announcement",
];

export function postTypesForContext(
  contextType: PostContextType,
  canPostOfficial: boolean
): PostType[] {
  if (contextType === "club") {
    return canPostOfficial
      ? [...CLUB_MEMBER_POST_TYPES, ...CLUB_OFFICIAL_POST_TYPES]
      : CLUB_MEMBER_POST_TYPES;
  }
  if (contextType === "event") {
    return canPostOfficial
      ? [...EVENT_MEMBER_POST_TYPES, ...EVENT_OFFICIAL_POST_TYPES]
      : EVENT_MEMBER_POST_TYPES;
  }
  return [];
}

export function canPostOfficial(
  contextType: PostContextType,
  club: Club | null | undefined,
  event: CarEvent | null | undefined,
  uid: string | null | undefined,
  isGlobalAdmin: boolean
): boolean {
  if (!uid) return false;
  if (isGlobalAdmin) return true;
  if (contextType === "club" && club) {
    return canManageClub(club, uid, false);
  }
  if (contextType === "event" && event) {
    if (event.createdByUid === uid) return true;
    return canManageEvent(event, club ?? null, uid, false);
  }
  return false;
}

export function canCreateClubPost(
  club: Club,
  uid: string | null | undefined,
  isGlobalAdmin: boolean,
  membership: ClubMember | null
): boolean {
  return resolveClubPostAccess({ club, uid, isGlobalAdmin, membership }).allowed;
}

export function canCreateEventPost(
  event: CarEvent,
  uid: string | null | undefined
): boolean {
  return Boolean(uid && (event.status === "approved" || event.status === "cancelled"));
}

export function canModeratePost(
  contextType: PostContextType,
  club: Club | null | undefined,
  event: CarEvent | null | undefined,
  uid: string | null | undefined,
  isGlobalAdmin: boolean
): boolean {
  if (!uid) return false;
  if (isGlobalAdmin) return true;
  if (contextType === "club" && club) {
    return canManageClub(club, uid, false);
  }
  if (contextType === "event" && event) {
    if (event.createdByUid === uid) return true;
    return canManageEvent(event, club ?? null, uid, false);
  }
  return false;
}

export function canPinPost(
  contextType: PostContextType,
  club: Club | null | undefined,
  event: CarEvent | null | undefined,
  uid: string | null | undefined,
  isGlobalAdmin: boolean
): boolean {
  return canModeratePost(contextType, club, event, uid, isGlobalAdmin);
}

export const MAX_PINNED_POSTS_PER_CONTEXT = 3;
