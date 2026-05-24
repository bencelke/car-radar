import type { ClubMember } from "@/lib/types";

/** Relative path under `public/` for a member car image (local dev). */
export function memberImagePublicPath(member: Pick<ClubMember, "id" | "clubId">): string {
  const clubId = member.clubId?.trim() || "wbn";
  return `public/data/clubs/${clubId}/images/${member.id}.webp`;
}

export function suggestedMemberImageFileName(memberId: string): string {
  return `${memberId}.webp`;
}
