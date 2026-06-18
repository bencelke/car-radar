import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  where,
} from "firebase/firestore";

import { garageFollowDocId } from "@/lib/garage/garage-follow";
import { isPublicGarage } from "@/lib/garage/garage-auth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  deleteMockGarageFollow,
  getMockGarageFollows,
  setMockGarageFollow,
} from "@/lib/mock-data/garage-social-store";
import { getMockGarages, setMockGarage } from "@/lib/mock-data/garage-store";
import type { GarageFollow, GarageProfile } from "@/lib/types";
import { getGarageById } from "@/lib/repositories/garages";
import { logRepositoryFallback } from "@/lib/repositories/utils";

export class GarageFollowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GarageFollowError";
  }
}

function currentFollowerCount(garage: GarageProfile): number {
  return garage.followerCount ?? 0;
}

export async function isFollowingGarage(
  followerUid: string,
  garageId: string
): Promise<boolean> {
  const id = garageFollowDocId(followerUid, garageId);
  if (!db) {
    return getMockGarageFollows().some((f) => f.id === id);
  }
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.garageFollows, id));
    return snap.exists();
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garageFollows, error);
    return getMockGarageFollows().some((f) => f.id === id);
  }
}

export async function getFollowerCount(garageId: string): Promise<number> {
  if (!db) {
    return getMockGarageFollows().filter((f) => f.garageId === garageId).length;
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.garageFollows),
      where("garageId", "==", garageId)
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garageFollows, error);
    return getMockGarageFollows().filter((f) => f.garageId === garageId).length;
  }
}

export async function getFollowingCount(followerUid: string): Promise<number> {
  const ids = await getFollowingGarageIds(followerUid);
  return ids.length;
}

export async function getFollowingGarageIds(followerUid: string): Promise<string[]> {
  if (!db) {
    return getMockGarageFollows()
      .filter((f) => f.followerUid === followerUid)
      .map((f) => f.garageId);
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.garageFollows),
      where("followerUid", "==", followerUid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => (d.data() as GarageFollow).garageId);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garageFollows, error);
    return getMockGarageFollows()
      .filter((f) => f.followerUid === followerUid)
      .map((f) => f.garageId);
  }
}

export async function getFollowingGarages(
  followerUid: string,
  max = 50
): Promise<GarageProfile[]> {
  const ids = (await getFollowingGarageIds(followerUid)).slice(0, max);
  const garages = await Promise.all(ids.map((id) => getGarageById(id)));
  return garages.filter((g): g is GarageProfile => g != null);
}

export async function getGarageFollowers(
  garageId: string,
  max = 50
): Promise<GarageFollow[]> {
  if (!db) {
    return getMockGarageFollows()
      .filter((f) => f.garageId === garageId)
      .slice(0, max);
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.garageFollows),
      where("garageId", "==", garageId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .slice(0, max)
      .map((d) => ({ id: d.id, ...d.data() }) as GarageFollow);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garageFollows, error);
    return getMockGarageFollows()
      .filter((f) => f.garageId === garageId)
      .slice(0, max);
  }
}

export async function followGarage(
  followerUid: string,
  garageId: string,
  garageOwnerUid: string
): Promise<GarageFollow> {
  if (followerUid === garageOwnerUid) {
    throw new GarageFollowError("You cannot follow your own garage.");
  }

  const garage = await getGarageById(garageId);
  if (!garage || !isPublicGarage(garage)) {
    throw new GarageFollowError("This garage cannot be followed.");
  }

  const now = new Date().toISOString();
  const id = garageFollowDocId(followerUid, garageId);
  const record: GarageFollow = {
    id,
    followerUid,
    garageId,
    garageOwnerUid,
    createdAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    if (getMockGarageFollows().some((f) => f.id === id)) return record;
    setMockGarageFollow(record);
    const mockGarage =
      getMockGarages().find((g) => g.id === garageId) ?? garage;
    setMockGarage({
      ...mockGarage,
      followerCount: currentFollowerCount(mockGarage) + 1,
      updatedAt: now,
    });
    return record;
  }

  await runTransaction(db, async (tx) => {
    const followRef = doc(db!, COLLECTIONS.garageFollows, id);
    const garageRef = doc(db!, COLLECTIONS.garages, garageId);
    const followSnap = await tx.get(followRef);
    if (followSnap.exists()) return;

    const garageSnap = await tx.get(garageRef);
    if (!garageSnap.exists()) {
      throw new GarageFollowError("Garage not found.");
    }
    const data = garageSnap.data() as GarageProfile;
    if (!isPublicGarage({ ...data, id: garageId })) {
      throw new GarageFollowError("This garage cannot be followed.");
    }
    if (data.ownerUid === followerUid) {
      throw new GarageFollowError("You cannot follow your own garage.");
    }

    const nextCount = currentFollowerCount(data) + 1;
    tx.set(followRef, sanitizeFirestoreData(record));
    tx.update(garageRef, {
      followerCount: nextCount,
      updatedAt: now,
    });
  });

  return record;
}

export async function unfollowGarage(
  followerUid: string,
  garageId: string
): Promise<void> {
  const id = garageFollowDocId(followerUid, garageId);
  const now = new Date().toISOString();

  if (!isFirebaseConfigured || !db) {
    if (!getMockGarageFollows().some((f) => f.id === id)) return;
    deleteMockGarageFollow(id);
    const mockGarage = getMockGarages().find((g) => g.id === garageId);
    if (mockGarage) {
      setMockGarage({
        ...mockGarage,
        followerCount: Math.max(0, currentFollowerCount(mockGarage) - 1),
        updatedAt: now,
      });
    }
    return;
  }

  await runTransaction(db, async (tx) => {
    const followRef = doc(db!, COLLECTIONS.garageFollows, id);
    const garageRef = doc(db!, COLLECTIONS.garages, garageId);
    const followSnap = await tx.get(followRef);
    if (!followSnap.exists()) return;

    const garageSnap = await tx.get(garageRef);
    const current = garageSnap.exists()
      ? currentFollowerCount(garageSnap.data() as GarageProfile)
      : 0;

    tx.delete(followRef);
    if (garageSnap.exists()) {
      tx.update(garageRef, {
        followerCount: Math.max(0, current - 1),
        updatedAt: now,
      });
    }
  });
}
