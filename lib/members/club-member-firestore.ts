import type { ClubMember } from "@/lib/types";

/** WBN and other JSON seed ids use this prefix in local dev. */
export function isLikelyLocalSeedMemberId(memberId: string): boolean {
  return memberId.startsWith("wbn-") || memberId.startsWith("member-");
}

/** Public fields to merge when promoting a seed member to Firestore. */
export function clubMemberToFirestoreBase(
  member: ClubMember
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: member.id,
    clubId: member.clubId,
    clubName: member.clubName,
    displayName: member.displayName,
    nickname: member.nickname,
    instagramHandle: member.instagramHandle,
    instagram: member.instagram,
    carName: member.carName,
    carMake: member.carMake,
    carModel: member.carModel,
    carYear: member.carYear,
    buildSummary: member.buildSummary,
    buildTags: member.buildTags,
    city: member.city,
    country: member.country,
    area: member.area,
    status: member.status || "approved",
    role: member.role ?? "member",
    verifiedByClub: member.verifiedByClub ?? false,
    featured: member.featured ?? false,
    claimStatus: member.claimStatus ?? "unclaimed",
    claimedByUid: member.claimedByUid ?? null,
    lat: member.lat,
    lng: member.lng,
    tiktok: member.tiktok,
    youtube: member.youtube,
  };

  return Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined && v !== "")
  );
}

export function mergeClubMemberRecords(
  base: ClubMember | undefined,
  overlay: ClubMember
): ClubMember {
  if (!base) return overlay;
  return {
    ...base,
    ...overlay,
    id: overlay.id || base.id,
    buildTags: overlay.buildTags ?? base.buildTags,
  };
}
