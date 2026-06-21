import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import type {
  Club,
  ClubMember,
  CarShop,
  ProfileClaim,
  ProfileClaimProofType,
  ProfileClaimStatus,
  ProfileClaimTargetType,
} from "@/lib/types";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

export type CreateProfileClaimInput = {
  targetType: ProfileClaimTargetType;
  targetId: string;
  targetName?: string | null;
  requestedByUid: string;
  requesterEmail?: string | null;
  requesterName?: string | null;
  proofType?: ProfileClaimProofType;
  proofText?: string | null;
  proofUrl?: string | null;
};

const mockClaims: ProfileClaim[] = [];

function sortNewest(items: ProfileClaim[]): ProfileClaim[] {
  return [...items].sort((a, b) =>
    String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))
  );
}

function mapDoc(id: string, data: Omit<ProfileClaim, "id">): ProfileClaim {
  return { id, ...data };
}

function normalizeClaim(raw: Record<string, unknown>, id: string): ProfileClaim {
  return {
    id,
    targetType: raw.targetType as ProfileClaimTargetType,
    targetId: String(raw.targetId ?? ""),
    targetName: (raw.targetName as string | null | undefined) ?? null,
    requestedByUid: String(raw.requestedByUid ?? ""),
    requesterEmail: (raw.requesterEmail as string | null | undefined) ?? null,
    requesterName: (raw.requesterName as string | null | undefined) ?? null,
    proofType: raw.proofType as ProfileClaim["proofType"],
    proofText: (raw.proofText as string | null | undefined) ?? null,
    proofUrl: (raw.proofUrl as string | null | undefined) ?? null,
    status: (raw.status as ProfileClaimStatus) ?? "pending",
    reviewedByUid: (raw.reviewedByUid as string | null | undefined) ?? null,
    reviewedAt: raw.reviewedAt,
    reviewNote: (raw.reviewNote as string | null | undefined) ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function createProfileClaim(
  input: CreateProfileClaimInput
): Promise<{ id: string }> {
  const now = new Date().toISOString();
  const payload = sanitizeFirestoreData({
    targetType: input.targetType,
    targetId: input.targetId,
    targetName: input.targetName?.trim() || null,
    requestedByUid: input.requestedByUid,
    requesterEmail: input.requesterEmail?.trim() || null,
    requesterName: input.requesterName?.trim() || null,
    proofType: input.proofType ?? "other",
    proofText: input.proofText?.trim() || null,
    proofUrl: input.proofUrl?.trim() || null,
    status: "pending" as ProfileClaimStatus,
    createdAt: now,
    updatedAt: now,
  });

  if (!db) {
    const id = generateId("claim");
    mockClaims.unshift(mapDoc(id, payload as Omit<ProfileClaim, "id">));
    return { id };
  }

  const existing = await getDocs(
    query(
      collection(db, COLLECTIONS.profileClaims),
      where("requestedByUid", "==", input.requestedByUid),
      where("targetType", "==", input.targetType),
      where("targetId", "==", input.targetId),
      where("status", "==", "pending")
    )
  );
  if (!existing.empty) {
    throw new Error("CLAIM_ALREADY_PENDING");
  }

  try {
    const ref = await addDoc(collection(db, COLLECTIONS.profileClaims), payload);
    return { id: ref.id };
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.profileClaims, error);
    const id = generateId("claim");
    mockClaims.unshift(mapDoc(id, payload as Omit<ProfileClaim, "id">));
    return { id };
  }
}

export async function getClaimsForUser(uid: string): Promise<ProfileClaim[]> {
  if (!db) {
    return sortNewest(mockClaims.filter((c) => c.requestedByUid === uid));
  }

  try {
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.profileClaims),
        where("requestedByUid", "==", uid)
      )
    );
    return sortNewest(
      snap.docs.map((d) => normalizeClaim(d.data() as Record<string, unknown>, d.id))
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.profileClaims, error);
    return sortNewest(mockClaims.filter((c) => c.requestedByUid === uid));
  }
}

export async function getPendingProfileClaims(): Promise<ProfileClaim[]> {
  return getProfileClaimsByStatus("pending");
}

export async function getProfileClaimsForAdmin(): Promise<ProfileClaim[]> {
  if (!db) {
    return sortNewest(mockClaims);
  }

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.profileClaims));
    return sortNewest(
      snap.docs.map((d) => normalizeClaim(d.data() as Record<string, unknown>, d.id))
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.profileClaims, error);
    return sortNewest(mockClaims);
  }
}

async function getProfileClaimsByStatus(
  status: ProfileClaimStatus
): Promise<ProfileClaim[]> {
  if (!db) {
    return sortNewest(mockClaims.filter((c) => c.status === status));
  }

  try {
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.profileClaims),
        where("status", "==", status)
      )
    );
    return sortNewest(
      snap.docs.map((d) => normalizeClaim(d.data() as Record<string, unknown>, d.id))
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.profileClaims, error);
    return sortNewest(mockClaims.filter((c) => c.status === status));
  }
}

export async function getProfileClaimById(
  claimId: string
): Promise<ProfileClaim | null> {
  if (!db) {
    return mockClaims.find((c) => c.id === claimId) ?? null;
  }

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.profileClaims, claimId));
    if (!snap.exists()) return null;
    return normalizeClaim(snap.data() as Record<string, unknown>, snap.id);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.profileClaims, error);
    return mockClaims.find((c) => c.id === claimId) ?? null;
  }
}

export async function adminUpdateProfileClaimStatus(
  claimId: string,
  status: ProfileClaimStatus,
  note: string | null,
  reviewedByUid: string
): Promise<void> {
  const now = new Date().toISOString();
  const patch = sanitizeFirestoreData({
    status,
    reviewNote: note?.trim() || null,
    reviewedByUid,
    reviewedAt: now,
    updatedAt: now,
  });

  if (!db) {
    const idx = mockClaims.findIndex((c) => c.id === claimId);
    if (idx >= 0) {
      mockClaims[idx] = { ...mockClaims[idx]!, ...patch };
    }
    return;
  }

  await updateDoc(doc(db, COLLECTIONS.profileClaims, claimId), patch);
}

/** Admin-only: assign ownership after claim approval. Requires Firestore admin rules. */
export async function adminAssignClaimOwner(params: {
  claimId: string;
  targetType: ProfileClaimTargetType;
  targetId: string;
  ownerUid: string;
  reviewedByUid: string;
  reviewNote?: string | null;
}): Promise<void> {
  if (!db) {
    await adminUpdateProfileClaimStatus(
      params.claimId,
      "approved",
      params.reviewNote ?? null,
      params.reviewedByUid
    );
    return;
  }

  const now = new Date().toISOString();

  if (params.targetType === "member") {
    await setDoc(
      doc(db, COLLECTIONS.clubMembers, params.targetId),
      sanitizeFirestoreData({
        claimStatus: "claimed",
        claimedByUid: params.ownerUid,
        updatedAt: now,
      }),
      { merge: true }
    );
  } else if (params.targetType === "club") {
    await setDoc(
      doc(db, COLLECTIONS.clubs, params.targetId),
      sanitizeFirestoreData({
        claimStatus: "claimed",
        ownerUid: params.ownerUid,
        updatedAt: now,
      }),
      { merge: true }
    );
  } else if (params.targetType === "shop") {
    await setDoc(
      doc(db, COLLECTIONS.carShops, params.targetId),
      sanitizeFirestoreData({
        claimStatus: "claimed",
        ownerUid: params.ownerUid,
        updatedAt: now,
      }),
      { merge: true }
    );
  }

  await adminUpdateProfileClaimStatus(
    params.claimId,
    "approved",
    params.reviewNote ?? null,
    params.reviewedByUid
  );
}

export async function loadClaimTargetName(
  targetType: ProfileClaimTargetType,
  targetId: string
): Promise<string | null> {
  if (!db) return null;

  try {
    if (targetType === "member") {
      const snap = await getDoc(doc(db, COLLECTIONS.clubMembers, targetId));
      if (!snap.exists()) return null;
      return (snap.data() as ClubMember).displayName ?? null;
    }
    if (targetType === "club") {
      const snap = await getDoc(doc(db, COLLECTIONS.clubs, targetId));
      if (!snap.exists()) return null;
      return (snap.data() as Club).name ?? null;
    }
    const snap = await getDoc(doc(db, COLLECTIONS.carShops, targetId));
    if (!snap.exists()) return null;
    return (snap.data() as CarShop).name ?? null;
  } catch {
    return null;
  }
}
