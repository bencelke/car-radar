import type {
  CarShop,
  Club,
  ClubMember,
  ListingClaimStatus,
  ProfileClaimTargetType,
} from "@/lib/types";

export type ClaimableRecord = Club | ClubMember | CarShop;

export function claimPagePath(
  targetType: ProfileClaimTargetType,
  targetId: string
): string {
  const params = new URLSearchParams({ targetType, targetId });
  return `/claim?${params.toString()}`;
}

export function claimLoginPath(
  targetType: ProfileClaimTargetType,
  targetId: string
): string {
  const next = encodeURIComponent(claimPagePath(targetType, targetId));
  return `/login?next=${next}`;
}

export function correctionRequestPath(
  targetType: "club" | "member" | "shop" | "event",
  targetId: string,
  targetName?: string,
  requestType: "correction" | "removal" | "duplicate" | "privacy" = "correction"
): string {
  const params = new URLSearchParams({
    targetType,
    targetId,
    requestType,
  });
  if (targetName) params.set("targetName", targetName);
  return `/request-correction?${params.toString()}`;
}

export function correctionLoginPath(
  targetType: "club" | "member" | "shop" | "event",
  targetId: string,
  targetName?: string,
  requestType: "correction" | "removal" | "duplicate" | "privacy" = "correction"
): string {
  const next = encodeURIComponent(
    correctionRequestPath(targetType, targetId, targetName, requestType)
  );
  return `/login?next=${next}`;
}

function memberClaimStatus(member: ClubMember): ListingClaimStatus {
  if (member.claimStatus) return member.claimStatus;
  if (member.claimedByUid) return "claimed";
  return "unclaimed";
}

function ownerClaimStatus(
  claimStatus: ListingClaimStatus | undefined,
  ownerUid: string | null | undefined
): ListingClaimStatus {
  if (claimStatus) return claimStatus;
  if (ownerUid) return "claimed";
  return "unclaimed";
}

export function getEffectiveClaimStatus(
  record: ClaimableRecord
): ListingClaimStatus {
  if ("claimedByUid" in record) {
    return memberClaimStatus(record);
  }
  const ownerRecord = record as Club | CarShop;
  return ownerClaimStatus(ownerRecord.claimStatus, ownerRecord.ownerUid);
}

export function isRecordArchivedOrDraft(record: ClaimableRecord): boolean {
  if (record.visibility === "draft" || record.visibility === "archived") {
    return true;
  }
  if ("status" in record) {
    const status = record.status;
    if (status === "draft" || status === "archived" || status === "rejected") {
      return true;
    }
    if ("claimedByUid" in record && status !== "approved") {
      return true;
    }
  }
  return false;
}

export function isRecordOwner(
  record: ClaimableRecord,
  uid: string | null | undefined
): boolean {
  if (!uid) return false;
  if ("claimedByUid" in record) {
    return record.claimedByUid === uid;
  }
  const ownerRecord = record as Club | CarShop;
  if (ownerRecord.ownerUid === uid) return true;
  return (ownerRecord.managerUids ?? []).includes(uid);
}

export function isRecordClaimed(record: ClaimableRecord): boolean {
  return getEffectiveClaimStatus(record) === "claimed";
}

export function isCommunityListed(record: ClaimableRecord): boolean {
  if (isRecordArchivedOrDraft(record)) return false;
  const status = getEffectiveClaimStatus(record);
  return status === "unclaimed" || status === "pending";
}

export function canShowClaimCta(
  record: ClaimableRecord,
  currentUid: string | null | undefined
): boolean {
  if (isRecordArchivedOrDraft(record)) return false;
  if (isRecordOwner(record, currentUid)) return false;
  const status = getEffectiveClaimStatus(record);
  return status === "unclaimed" || status === "pending";
}

export function claimCtaLabelKey(
  targetType: ProfileClaimTargetType
): "claimThisClub" | "claimThisGarage" | "claimThisShop" {
  switch (targetType) {
    case "club":
      return "claimThisClub";
    case "member":
      return "claimThisGarage";
    case "shop":
      return "claimThisShop";
  }
}
