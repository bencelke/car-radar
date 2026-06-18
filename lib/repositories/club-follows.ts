import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { clubFollowDocId } from "@/lib/clubs/club-auth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  deleteMockFollow,
  getMockFollows,
  setMockFollow,
} from "@/lib/mock-data/community-store";
import type { ClubFollow } from "@/lib/types";
import { logRepositoryFallback } from "@/lib/repositories/utils";

export class RepositoryMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RepositoryMutationError";
  }
}

function requireFirebaseForMutation(): void {
  if (!isFirebaseConfigured || !db) {
    throw new RepositoryMutationError(
      "Firebase is not configured. Club follows require Firestore."
    );
  }
}

export async function isFollowingClub(
  userId: string,
  clubId: string
): Promise<boolean> {
  const id = clubFollowDocId(userId, clubId);
  if (!db) {
    return getMockFollows().some((f) => f.id === id);
  }
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.clubFollows, id));
    return snap.exists();
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubFollows, error);
    return getMockFollows().some((f) => f.id === id);
  }
}

export async function getFollowedClubIds(userId: string): Promise<string[]> {
  if (!db) {
    return getMockFollows()
      .filter((f) => f.userId === userId)
      .map((f) => f.clubId);
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.clubFollows),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => (d.data() as ClubFollow).clubId);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubFollows, error);
    return getMockFollows()
      .filter((f) => f.userId === userId)
      .map((f) => f.clubId);
  }
}

export async function getClubFollowerCount(clubId: string): Promise<number> {
  const ids = await getClubFollowerUserIds(clubId);
  return ids.length;
}

export async function getClubFollowerUserIds(clubId: string): Promise<string[]> {
  if (!db) {
    return getMockFollows()
      .filter((f) => f.clubId === clubId)
      .map((f) => f.userId);
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.clubFollows),
      where("clubId", "==", clubId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => (d.data() as ClubFollow).userId);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubFollows, error);
    return getMockFollows()
      .filter((f) => f.clubId === clubId)
      .map((f) => f.userId);
  }
}

export async function followClub(
  userId: string,
  clubId: string
): Promise<ClubFollow> {
  const now = new Date().toISOString();
  const id = clubFollowDocId(userId, clubId);
  const record: ClubFollow = { id, userId, clubId, createdAt: now };

  if (!isFirebaseConfigured || !db) {
    setMockFollow(record);
    return record;
  }

  await setDoc(
    doc(db, COLLECTIONS.clubFollows, id),
    sanitizeFirestoreData(record)
  );
  return record;
}

export async function unfollowClub(
  userId: string,
  clubId: string
): Promise<void> {
  const id = clubFollowDocId(userId, clubId);

  if (!isFirebaseConfigured || !db) {
    deleteMockFollow(id);
    return;
  }

  await deleteDoc(doc(db, COLLECTIONS.clubFollows, id));
}
