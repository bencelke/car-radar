import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { clubMemberToFirestoreBase } from "@/lib/members/club-member-firestore";
import { getPublishedMembers } from "@/lib/mock-data/published-store";
import { mockClubMembers } from "@/lib/mock-data/seeds";
import type { RepositoryUser } from "@/lib/repositories/repository-user";
import type { ClubMember, ProfileImageFields } from "@/lib/types";
import {
  filterApprovedMembers,
  logRepositoryFallback,
  sortFeaturedFirst,
} from "@/lib/repositories/utils";

export type ClubMemberImageUpdate = ProfileImageFields & {
  avatarUrl: string;
  imageUrl: string;
  imageStoragePath: string;
  imageUpdatedAt: string;
  imageSizeBytes: number;
  imageContentType: string;
};

export type BulkMemberWriteResult = {
  saved: number;
  skipped: number;
  errors: string[];
};

function approvedMembersWithPublished(): ClubMember[] {
  return filterApprovedMembers([...getPublishedMembers(), ...mockClubMembers]);
}

function mergeMemberLists(
  firestore: ClubMember[],
  mock: ClubMember[]
): ClubMember[] {
  const map = new Map<string, ClubMember>();
  for (const m of mock) {
    map.set(m.id, m);
  }
  for (const m of firestore) {
    const prev = map.get(m.id);
    map.set(m.id, prev ? { ...prev, ...m, id: m.id } : m);
  }
  return Array.from(map.values());
}

async function fetchApprovedFromFirestore(): Promise<ClubMember[]> {
  if (!db) return [];

  const q = query(
    collection(db, COLLECTIONS.clubMembers),
    where("status", "==", "approved")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as ClubMember
  );
}

export async function clubMemberExistsInFirestore(
  memberId: string
): Promise<boolean> {
  if (!db) return false;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.clubMembers, memberId));
    return snap.exists();
  } catch {
    return false;
  }
}

export async function getApprovedClubMembers(): Promise<ClubMember[]> {
  const mock = approvedMembersWithPublished();
  if (!db) return sortFeaturedFirst(mock);

  try {
    const firestore = await fetchApprovedFromFirestore();
    return sortFeaturedFirst(mergeMemberLists(firestore, mock));
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubMembers, error);
    return sortFeaturedFirst(mock);
  }
}

export async function getMembersByClubId(clubId: string): Promise<ClubMember[]> {
  const mock = filterApprovedMembers(
    approvedMembersWithPublished().filter((m) => m.clubId === clubId)
  );
  if (!db) return sortFeaturedFirst(mock);

  try {
    const q = query(
      collection(db, COLLECTIONS.clubMembers),
      where("clubId", "==", clubId),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    const firestore = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as ClubMember
    );
    return sortFeaturedFirst(mergeMemberLists(firestore, mock));
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubMembers, error);
    return sortFeaturedFirst(mock);
  }
}

export async function getFeaturedMembers(): Promise<ClubMember[]> {
  const members = await getApprovedClubMembers();
  return members.filter((m) => m.featured);
}

export async function createOrUpdateClubMember(
  member: ClubMember,
  actor?: RepositoryUser
): Promise<void> {
  if (!db) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const now = new Date().toISOString();
  const ref = doc(db, COLLECTIONS.clubMembers, member.id);
  const existing = await getDoc(ref);
  const existingData = existing.exists()
    ? (existing.data() as ClubMember)
    : null;

  const claimedByUid =
    member.claimedByUid !== undefined
      ? member.claimedByUid
      : (existingData?.claimedByUid ?? null);

  const claimStatus =
    member.claimStatus ?? existingData?.claimStatus ?? "unclaimed";

  const payload: ClubMember = {
    ...clubMemberToFirestoreBase(member),
    ...member,
    id: member.id,
    claimStatus,
    claimedByUid,
    imageUrl: member.imageUrl,
    avatarUrl: member.avatarUrl ?? member.imageUrl,
    updatedAt: now,
    updatedByUid: actor?.uid ?? member.updatedByUid,
    createdAt: existingData?.createdAt ?? member.createdAt ?? now,
    createdByUid:
      existingData?.createdByUid ?? member.createdByUid ?? actor?.uid,
  };

  await setDoc(ref, payload, { merge: true });
}

export async function bulkCreateOrUpdateClubMembers(
  members: ClubMember[],
  actor?: RepositoryUser
): Promise<BulkMemberWriteResult> {
  let saved = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const member of members) {
    if (!member.id?.trim() || !member.clubId?.trim()) {
      skipped += 1;
      continue;
    }
    try {
      await createOrUpdateClubMember(member, actor);
      saved += 1;
    } catch (e) {
      skipped += 1;
      errors.push(
        `${member.id}: ${e instanceof Error ? e.message : "Save failed"}`
      );
    }
  }

  return { saved, skipped, errors };
}

/**
 * Placeholder for future claim flow — not wired in UI yet.
 */
export async function requestMemberClaim(
  memberId: string,
  uid: string
): Promise<void> {
  if (!db) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const ref = doc(db, COLLECTIONS.clubMembers, memberId);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    throw new Error("MEMBER_NOT_FOUND");
  }

  const data = existing.data() as ClubMember;
  if (data.claimStatus === "claimed" && data.claimedByUid) {
    throw new Error("MEMBER_ALREADY_CLAIMED");
  }

  const now = new Date().toISOString();
  await setDoc(
    ref,
    {
      claimStatus: "pending",
      updatedAt: now,
    },
    { merge: true }
  );

  void uid;
}

export async function updateClubMemberImage(
  memberId: string,
  image: ClubMemberImageUpdate,
  baseMember?: ClubMember,
  actor?: RepositoryUser
): Promise<void> {
  if (!db) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const now = image.imageUpdatedAt || new Date().toISOString();
  const base = baseMember ? clubMemberToFirestoreBase(baseMember) : {};

  await setDoc(
    doc(db, COLLECTIONS.clubMembers, memberId),
    {
      ...base,
      id: memberId,
      avatarUrl: image.avatarUrl,
      imageUrl: image.imageUrl,
      imageStoragePath: image.imageStoragePath,
      imageUpdatedAt: now,
      imageSizeBytes: image.imageSizeBytes,
      imageContentType: image.imageContentType,
      updatedAt: now,
      ...(actor?.uid ? { updatedByUid: actor.uid } : {}),
    },
    { merge: true }
  );
}

/** @deprecated Use updateClubMemberImage */
export async function updateClubMemberProfileImage(
  memberId: string,
  image: ClubMemberImageUpdate,
  baseMember?: ClubMember
): Promise<void> {
  return updateClubMemberImage(memberId, image, baseMember);
}

export async function getApprovedClubMembershipForUser(
  clubId: string,
  uid: string
): Promise<ClubMember | null> {
  const fromMock = approvedMembersWithPublished().find(
    (m) =>
      m.clubId === clubId &&
      m.claimedByUid === uid &&
      m.claimStatus === "claimed" &&
      m.status === "approved"
  );
  if (!db) return fromMock ?? null;

  try {
    const q = query(
      collection(db, COLLECTIONS.clubMembers),
      where("clubId", "==", clubId),
      where("claimedByUid", "==", uid),
      where("status", "==", "approved"),
      where("claimStatus", "==", "claimed")
    );
    const snap = await getDocs(q);
    const member = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as ClubMember)
      .find((m) => m.claimStatus === "claimed" && m.status === "approved");
    return member ?? fromMock ?? null;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubMembers, error);
    return fromMock ?? null;
  }
}

export async function getClaimedMemberForUser(
  uid: string
): Promise<ClubMember | null> {
  const fromMock = approvedMembersWithPublished().find(
    (m) => m.claimedByUid === uid && m.claimStatus === "claimed"
  );
  if (!db) return fromMock ?? null;

  try {
    const q = query(
      collection(db, COLLECTIONS.clubMembers),
      where("claimedByUid", "==", uid),
      where("status", "==", "approved"),
      where("claimStatus", "==", "claimed")
    );
    const snap = await getDocs(q);
    const member = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as ClubMember)
      .find((m) => m.claimStatus === "claimed" && m.status === "approved");
    return member ?? fromMock ?? null;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubMembers, error);
    return fromMock ?? null;
  }
}

export async function getClubMemberById(id: string): Promise<ClubMember | null> {
  const mockList = approvedMembersWithPublished();
  const fromMock = mockList.find((m) => m.id === id);
  if (!db) return fromMock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.clubMembers, id));
    if (!snap.exists()) return fromMock ?? null;
    const fromFirestore = { id: snap.id, ...snap.data() } as ClubMember;
    if (fromFirestore.status !== "approved") return null;
    return fromMock
      ? { ...fromMock, ...fromFirestore, id: snap.id }
      : fromFirestore;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubMembers, error);
    return fromMock ?? null;
  }
}
