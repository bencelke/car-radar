import type { RepositoryUser } from "@/lib/repositories/repository-user";
import { bulkCreateOrUpdateClubMembers } from "@/lib/repositories/club-members";
import { createOrUpdateClub } from "@/lib/repositories/clubs";
import type { Club, ClubMember } from "@/lib/types";
import type { ClubImportBundle } from "@/lib/import/club-member-import";

export type FirestoreClubImportResult = {
  clubSaved: boolean;
  membersSaved: number;
  membersSkipped: number;
  errors: string[];
};

export function prepareClubForFirestore(
  club: Club,
  actor?: RepositoryUser
): Club {
  const now = new Date().toISOString();
  return {
    ...club,
    status: club.status || "approved",
    claimStatus: club.claimStatus ?? "unclaimed",
    ownerUid: club.ownerUid ?? null,
    managerUids: club.managerUids ?? [],
    source: club.source ?? "club_import",
    visibility: club.visibility ?? "public",
    updatedAt: now,
    updatedByUid: actor?.uid ?? club.updatedByUid,
    createdByUid: club.createdByUid ?? actor?.uid,
  };
}

export function prepareMemberForFirestore(
  member: ClubMember,
  actor?: RepositoryUser
): ClubMember {
  const now = new Date().toISOString();
  return {
    ...member,
    status: member.status || "approved",
    claimStatus: member.claimStatus ?? "unclaimed",
    claimedByUid: member.claimedByUid ?? null,
    source: member.source ?? "club_import",
    visibility: member.visibility ?? "public",
    updatedAt: now,
    updatedByUid: actor?.uid ?? member.updatedByUid,
    createdByUid: member.createdByUid ?? actor?.uid,
  };
}

export async function importClubBundleToFirestore(
  bundle: ClubImportBundle,
  actor: RepositoryUser
): Promise<FirestoreClubImportResult> {
  const errors: string[] = [];
  let clubSaved = false;
  let membersSaved = 0;
  let membersSkipped = 0;

  try {
    const club = prepareClubForFirestore(
      { ...bundle.club, memberCount: bundle.members.length },
      actor
    );
    await createOrUpdateClub(club, actor);
    clubSaved = true;
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Club save failed");
  }

  const members = bundle.members.map((m) => prepareMemberForFirestore(m, actor));

  try {
    const bulk = await bulkCreateOrUpdateClubMembers(members, actor);
    membersSaved = bulk.saved;
    membersSkipped = bulk.skipped;
    errors.push(...bulk.errors);
  } catch (e) {
    errors.push(e instanceof Error ? e.message : "Members save failed");
  }

  return { clubSaved, membersSaved, membersSkipped, errors };
}
