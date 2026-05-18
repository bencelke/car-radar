import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { mockClubMembers } from "@/lib/mock-data/seeds";
import type { ClubMember } from "@/lib/types";
import {
  filterApprovedMembers,
  logRepositoryFallback,
  sortFeaturedFirst,
} from "@/lib/repositories/utils";

async function fetchApprovedFromFirestore(): Promise<ClubMember[]> {
  if (!db) return filterApprovedMembers(mockClubMembers);

  const q = query(
    collection(db, COLLECTIONS.clubMembers),
    where("status", "==", "approved")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as ClubMember
  );
}

export async function getApprovedClubMembers(): Promise<ClubMember[]> {
  try {
    const members = await fetchApprovedFromFirestore();
    return sortFeaturedFirst(
      members.length > 0 ? members : filterApprovedMembers(mockClubMembers)
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubMembers, error);
    return sortFeaturedFirst(filterApprovedMembers(mockClubMembers));
  }
}

export async function getMembersByClubId(clubId: string): Promise<ClubMember[]> {
  const fromMock = filterApprovedMembers(
    mockClubMembers.filter((m) => m.clubId === clubId)
  );
  if (!db) return sortFeaturedFirst(fromMock);

  try {
    const q = query(
      collection(db, COLLECTIONS.clubMembers),
      where("clubId", "==", clubId),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    const members = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as ClubMember
    );
    return sortFeaturedFirst(members.length > 0 ? members : fromMock);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubMembers, error);
    return sortFeaturedFirst(fromMock);
  }
}

export async function getFeaturedMembers(): Promise<ClubMember[]> {
  const members = await getApprovedClubMembers();
  return members.filter((m) => m.featured);
}

export async function getClubMemberById(id: string): Promise<ClubMember | null> {
  const fromMock = mockClubMembers.find(
    (m) => m.id === id && m.status === "approved"
  );
  if (!db) return fromMock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.clubMembers, id));
    if (!snap.exists()) return fromMock ?? null;
    const member = { id: snap.id, ...snap.data() } as ClubMember;
    return member.status === "approved" ? member : null;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubMembers, error);
    return fromMock ?? null;
  }
}
