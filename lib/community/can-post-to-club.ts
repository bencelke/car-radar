import { canManageClub } from "@/lib/clubs/club-auth";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import type { Club, ClubMember } from "@/lib/types";

/** Private beta: allow any signed-in user to post until membership claim flow is universal. */
export const BETA_OPEN_CLUB_POSTING = true;

export type ClubPostAccessReason =
  | "signed_out"
  | "not_member"
  | "club_inactive"
  | "firebase_unavailable"
  | "allowed";

export type ClubPostAccess = {
  allowed: boolean;
  reason: ClubPostAccessReason;
  canPostOfficial: boolean;
  canModerate: boolean;
  isMember: boolean;
  betaOpenPosting: boolean;
};

function isApprovedClub(club: Club): boolean {
  return club.status === "approved";
}

function isClaimedMember(membership: ClubMember | null, clubId: string, uid: string): boolean {
  return Boolean(
    membership &&
      membership.clubId === clubId &&
      membership.status === "approved" &&
      membership.claimStatus === "claimed" &&
      membership.claimedByUid === uid
  );
}

export function resolveClubPostAccess({
  club,
  uid,
  isGlobalAdmin,
  membership,
  firebaseAvailable = isFirebaseConfigured,
}: {
  club: Club;
  uid: string | null | undefined;
  isGlobalAdmin: boolean;
  membership: ClubMember | null;
  firebaseAvailable?: boolean;
}): ClubPostAccess {
  const canModerate = Boolean(uid && canManageClub(club, uid, isGlobalAdmin));
  const canPostOfficial = canModerate;
  const isMember = Boolean(uid && isClaimedMember(membership, club.id, uid));
  const betaOpenPosting = BETA_OPEN_CLUB_POSTING;

  if (!firebaseAvailable) {
    return {
      allowed: false,
      reason: "firebase_unavailable",
      canPostOfficial: false,
      canModerate,
      isMember,
      betaOpenPosting,
    };
  }

  if (!isApprovedClub(club)) {
    return {
      allowed: false,
      reason: "club_inactive",
      canPostOfficial: false,
      canModerate,
      isMember,
      betaOpenPosting,
    };
  }

  if (!uid) {
    return {
      allowed: false,
      reason: "signed_out",
      canPostOfficial: false,
      canModerate: false,
      isMember: false,
      betaOpenPosting,
    };
  }

  if (canModerate || isMember || betaOpenPosting) {
    return {
      allowed: true,
      reason: "allowed",
      canPostOfficial,
      canModerate,
      isMember,
      betaOpenPosting,
    };
  }

  return {
    allowed: false,
    reason: "not_member",
    canPostOfficial: false,
    canModerate: false,
    isMember: false,
    betaOpenPosting,
  };
}
