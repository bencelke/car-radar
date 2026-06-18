import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { emitGarageFeedEvent, garageDisplayLabel, carTitle } from "@/lib/garage/feed-generator";
import {
  assertGarageOwner,
  GarageMutationError,
} from "@/lib/garage/garage-auth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  getMockGarages,
  setMockGarage,
} from "@/lib/mock-data/garage-store";
import type { GarageProfile, GarageVisibility } from "@/lib/types";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

export type CreateGarageInput = {
  displayName: string;
  instagramHandle?: string;
  clubId?: string;
  clubName?: string;
  city?: string;
  area?: string;
  country?: string;
  visibility?: GarageVisibility;
  memberProfileId?: string;
};

export async function getGarageByOwnerUid(
  ownerUid: string
): Promise<GarageProfile | null> {
  const mock = getMockGarages().find((g) => g.ownerUid === ownerUid);
  if (!db) return mock ?? null;

  try {
    const q = query(
      collection(db, COLLECTIONS.garages),
      where("ownerUid", "==", ownerUid)
    );
    const snap = await getDocs(q);
    const docSnap = snap.docs[0];
    if (!docSnap) return mock ?? null;
    const item = { id: docSnap.id, ...docSnap.data() } as GarageProfile;
    return item;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garages, error);
    return mock ?? null;
  }
}

export async function getGarageById(id: string): Promise<GarageProfile | null> {
  const mock = getMockGarages().find((g) => g.id === id);
  if (!db) return mock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.garages, id));
    if (!snap.exists()) return mock ?? null;
    return { id: snap.id, ...snap.data() } as GarageProfile;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garages, error);
    return mock ?? null;
  }
}

export async function getGarageByMemberProfileId(
  memberProfileId: string
): Promise<GarageProfile | null> {
  const mock = getMockGarages().find(
    (g) => g.memberProfileId === memberProfileId
  );
  if (!db) return mock ?? null;

  try {
    const q = query(
      collection(db, COLLECTIONS.garages),
      where("memberProfileId", "==", memberProfileId)
    );
    const snap = await getDocs(q);
    const docSnap = snap.docs[0];
    if (!docSnap) return mock ?? null;
    return { id: docSnap.id, ...docSnap.data() } as GarageProfile;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garages, error);
    return mock ?? null;
  }
}

function normalizeInstagram(handle?: string): {
  instagramHandle?: string;
  instagram?: string;
} {
  if (!handle?.trim()) return {};
  const bare = handle.trim().replace(/^@/, "");
  return {
    instagramHandle: bare,
    instagram: `https://instagram.com/${bare}`,
  };
}

export async function createGarageForUser(
  ownerUid: string,
  input: CreateGarageInput
): Promise<GarageProfile> {
  const existing = await getGarageByOwnerUid(ownerUid);
  if (existing) return existing;

  const now = new Date().toISOString();
  const id = generateId("garage");
  const social = normalizeInstagram(input.instagramHandle);
  const garage: GarageProfile = {
    id,
    ownerUid,
    memberProfileId: input.memberProfileId,
    displayName: input.displayName.trim(),
    ...social,
    clubId: input.clubId,
    clubName: input.clubName,
    city: input.city?.trim(),
    area: input.area?.trim(),
    country: input.country?.trim(),
    visibility: input.visibility ?? "public",
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockGarage(garage);
    return garage;
  }

  await setDoc(
    doc(db, COLLECTIONS.garages, id),
    sanitizeFirestoreData(garage as unknown as Record<string, unknown>)
  );
  return garage;
}

export async function updateGarage(
  ownerUid: string,
  patch: Partial<
    Pick<
      GarageProfile,
      | "displayName"
      | "instagramHandle"
      | "instagram"
      | "clubId"
      | "clubName"
      | "city"
      | "area"
      | "country"
      | "visibility"
      | "memberProfileId"
      | "primaryCarId"
    >
  >,
  isAdmin = false
): Promise<GarageProfile> {
  const garage = await getGarageByOwnerUid(ownerUid);
  if (!garage) throw new GarageMutationError("Garage not found.");
  assertGarageOwner(garage.ownerUid, ownerUid, isAdmin);

  const social =
    patch.instagramHandle !== undefined
      ? normalizeInstagram(patch.instagramHandle)
      : {};

  const updated: GarageProfile = {
    ...garage,
    ...patch,
    ...social,
    ownerUid: garage.ownerUid,
    id: garage.id,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    setMockGarage(updated);
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.garages, garage.id),
    sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
    { merge: true }
  );
  return updated;
}

export async function publishGarage(
  ownerUid: string,
  isAdmin = false
): Promise<GarageProfile> {
  return updateGarageStatus(ownerUid, "published", isAdmin);
}

export async function unpublishGarage(
  ownerUid: string,
  isAdmin = false
): Promise<GarageProfile> {
  return updateGarageStatus(ownerUid, "draft", isAdmin);
}

export async function archiveGarage(
  ownerUid: string,
  isAdmin = false
): Promise<GarageProfile> {
  return updateGarageStatus(ownerUid, "archived", isAdmin);
}

async function updateGarageStatus(
  ownerUid: string,
  status: GarageProfile["status"],
  isAdmin: boolean
): Promise<GarageProfile> {
  const garage = await getGarageByOwnerUid(ownerUid);
  if (!garage) throw new GarageMutationError("Garage not found.");
  assertGarageOwner(garage.ownerUid, ownerUid, isAdmin);

  const updated: GarageProfile = {
    ...garage,
    status,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    setMockGarage(updated);
    if (status === "published") void emitPublishedFeed(updated);
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.garages, garage.id),
    sanitizeFirestoreData({ status, updatedAt: updated.updatedAt }),
    { merge: true }
  );
  if (status === "published") void emitPublishedFeed(updated);
  return updated;
}

async function emitPublishedFeed(garage: GarageProfile): Promise<void> {
  const { getPrimaryCarByGarageId } = await import("@/lib/repositories/garage-cars");
  const car = await getPrimaryCarByGarageId(garage.id);
  void emitGarageFeedEvent({
    garageId: garage.id,
    carId: car?.id,
    ownerUid: garage.ownerUid,
    type: "garage_published",
    title: `${garageDisplayLabel(garage)} published their garage`,
    body: car ? carTitle(car) : undefined,
    imageUrl: car?.primaryImageUrl,
    dedupeKey: "published",
  });
}

export async function linkMemberProfileToGarage(
  ownerUid: string,
  memberProfileId: string,
  isAdmin = false
): Promise<GarageProfile> {
  return updateGarage(ownerUid, { memberProfileId }, isAdmin);
}

export async function getFeaturedGarages(max = 6): Promise<GarageProfile[]> {
  return queryDiscoverGarages("featured", max);
}

export async function getRecentlyUpdatedGarages(
  max = 6
): Promise<GarageProfile[]> {
  return queryDiscoverGarages("recent", max);
}

export async function getPopularGarages(max = 6): Promise<GarageProfile[]> {
  return queryDiscoverGarages("popular", max);
}

type DiscoverMode = "featured" | "recent" | "popular";

async function queryDiscoverGarages(
  mode: DiscoverMode,
  max: number
): Promise<GarageProfile[]> {
  const mock = getMockGarages()
    .filter((g) => g.visibility === "public" && g.status === "published")
    .sort((a, b) => {
      if (mode === "popular") {
        return (b.followerCount ?? 0) - (a.followerCount ?? 0);
      }
      if (mode === "featured") {
        if (Boolean(b.featured) !== Boolean(a.featured)) {
          return Number(b.featured) - Number(a.featured);
        }
      }
      return (
        new Date(b.lastActivityAt ?? b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.lastActivityAt ?? a.updatedAt ?? a.createdAt).getTime()
      );
    })
    .slice(0, max);

  if (!db) return mock;

  try {
    let q;
    if (mode === "featured") {
      q = query(
        collection(db, COLLECTIONS.garages),
        where("status", "==", "published"),
        where("visibility", "==", "public"),
        where("featured", "==", true),
        orderBy("lastActivityAt", "desc"),
        limit(max)
      );
    } else if (mode === "popular") {
      q = query(
        collection(db, COLLECTIONS.garages),
        where("status", "==", "published"),
        where("visibility", "==", "public"),
        orderBy("followerCount", "desc"),
        limit(max)
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.garages),
        where("status", "==", "published"),
        where("visibility", "==", "public"),
        orderBy("lastActivityAt", "desc"),
        limit(max)
      );
    }
    const snap = await getDocs(q);
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as GarageProfile
    );
    return items.length > 0 ? items : mock;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garages, error);
    return mock;
  }
}
