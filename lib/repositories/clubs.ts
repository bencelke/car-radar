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
import type { ClubDevImageKind } from "@/lib/clubs/club-image-path";
import { getPublishedClubs } from "@/lib/mock-data/published-store";
import { mockClubs } from "@/lib/mock-data/seeds";
import type { RepositoryUser } from "@/lib/repositories/repository-user";
import type { Club } from "@/lib/types";
import {
  filterApproved,
  logRepositoryFallback,
  sortFeaturedFirst,
} from "@/lib/repositories/utils";

function approvedClubsWithPublished(): Club[] {
  return filterApproved([...getPublishedClubs(), ...mockClubs]);
}

function mergeClubLists(firestore: Club[], mock: Club[]): Club[] {
  const map = new Map<string, Club>();
  for (const c of mock) {
    map.set(c.id, c);
  }
  for (const c of firestore) {
    const prev = map.get(c.id);
    map.set(c.id, prev ? { ...prev, ...c, id: c.id } : c);
  }
  return Array.from(map.values());
}

async function fetchApprovedFromFirestore(): Promise<Club[]> {
  if (!db) return [];

  const q = query(
    collection(db, COLLECTIONS.clubs),
    where("status", "==", "approved")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Club);
}

export async function getApprovedClubs(): Promise<Club[]> {
  const mock = approvedClubsWithPublished();
  if (!db) return sortFeaturedFirst(mock);

  try {
    const firestore = await fetchApprovedFromFirestore();
    return sortFeaturedFirst(mergeClubLists(firestore, mock));
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubs, error);
    return sortFeaturedFirst(mock);
  }
}

export async function getFeaturedClubs(): Promise<Club[]> {
  const clubs = await getApprovedClubs();
  return clubs.filter((club) => club.featured);
}

export async function getClubById(id: string): Promise<Club | null> {
  const fromMock = approvedClubsWithPublished().find((c) => c.id === id);
  if (!db) return fromMock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.clubs, id));
    if (!snap.exists()) return fromMock ?? null;
    const club = { id: snap.id, ...snap.data() } as Club;
    if (club.status !== "approved") return fromMock ?? null;
    return fromMock ? { ...fromMock, ...club, id: snap.id } : club;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubs, error);
    return fromMock ?? null;
  }
}

export async function getClubBySlug(slug: string): Promise<Club | null> {
  const fromMock = approvedClubsWithPublished().find((c) => c.slug === slug);
  if (!db) return fromMock ?? null;

  try {
    const q = query(
      collection(db, COLLECTIONS.clubs),
      where("slug", "==", slug),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return fromMock ?? null;
    const docSnap = snapshot.docs[0];
    const club = { id: docSnap.id, ...docSnap.data() } as Club;
    return fromMock ? { ...fromMock, ...club, id: docSnap.id } : club;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubs, error);
    return fromMock ?? null;
  }
}

export type ClubDetailsPatch = Partial<
  Omit<Club, "id" | "slug" | "status" | "createdAt">
>;

export type ClubImageUpdate = {
  coverImageUrl?: string;
  logoUrl?: string;
  imageUrl?: string;
  imageStoragePath?: string;
  imageUpdatedAt?: string;
  imageSizeBytes?: number;
  imageContentType?: string;
};

export async function createOrUpdateClub(
  club: Club,
  actor?: RepositoryUser
): Promise<void> {
  if (!db) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const now = new Date().toISOString();
  const ref = doc(db, COLLECTIONS.clubs, club.id);
  const existing = await getDoc(ref);
  const existingData = existing.exists() ? (existing.data() as Club) : null;

  const payload: Club = {
    ...club,
    id: club.id,
    slug: club.slug?.trim() || club.id,
    updatedAt: now,
    updatedByUid: actor?.uid ?? club.updatedByUid,
    createdAt: existingData?.createdAt ?? club.createdAt ?? now,
    createdByUid: existingData?.createdByUid ?? club.createdByUid ?? actor?.uid,
  };

  await setDoc(ref, payload, { merge: true });
}

/** Persists club field edits to Firestore (requires Firebase). */
export async function updateClubDetails(
  clubId: string,
  patch: ClubDetailsPatch,
  actor?: RepositoryUser
): Promise<void> {
  if (!db) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const now = new Date().toISOString();
  await setDoc(
    doc(db, COLLECTIONS.clubs, clubId),
    {
      ...patch,
      id: clubId,
      updatedAt: now,
      ...(actor?.uid ? { updatedByUid: actor.uid } : {}),
    },
    { merge: true }
  );
}

/** Updates club cover/logo metadata in Firestore. */
export async function updateClubImage(
  clubId: string,
  imageKind: ClubDevImageKind,
  image: ClubImageUpdate,
  baseClub?: Club,
  actor?: RepositoryUser
): Promise<void> {
  if (!db) {
    throw new Error("FIREBASE_NOT_CONFIGURED");
  }

  const now = image.imageUpdatedAt || new Date().toISOString();
  const payload: Record<string, unknown> = {
    id: clubId,
    updatedAt: now,
    imageStoragePath: image.imageStoragePath,
    imageUpdatedAt: now,
    imageSizeBytes: image.imageSizeBytes,
    imageContentType: image.imageContentType,
    ...(actor?.uid ? { updatedByUid: actor.uid } : {}),
  };

  if (imageKind === "cover") {
    payload.coverImageUrl = image.coverImageUrl;
    payload.imageUrl = image.coverImageUrl ?? image.imageUrl;
  } else {
    payload.logoUrl = image.logoUrl;
  }

  if (baseClub) {
    const { id: _id, ...rest } = baseClub;
    Object.assign(payload, rest);
  }

  await setDoc(doc(db, COLLECTIONS.clubs, clubId), payload, { merge: true });
}
