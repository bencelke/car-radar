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
import { getPublishedClubs } from "@/lib/mock-data/published-store";
import { mockClubs } from "@/lib/mock-data/seeds";
import type { Club } from "@/lib/types";
import {
  filterApproved,
  logRepositoryFallback,
  sortFeaturedFirst,
} from "@/lib/repositories/utils";

function approvedClubsWithPublished(): Club[] {
  return filterApproved([...getPublishedClubs(), ...mockClubs]);
}

async function fetchApprovedFromFirestore(): Promise<Club[]> {
  if (!db) return approvedClubsWithPublished();

  const q = query(
    collection(db, COLLECTIONS.clubs),
    where("status", "==", "approved")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Club);
}

export async function getApprovedClubs(): Promise<Club[]> {
  try {
    const clubs = await fetchApprovedFromFirestore();
    return sortFeaturedFirst(
      clubs.length > 0 ? clubs : approvedClubsWithPublished()
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubs, error);
    return sortFeaturedFirst(approvedClubsWithPublished());
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
    return club.status === "approved" ? club : null;
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
    return { id: docSnap.id, ...docSnap.data() } as Club;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubs, error);
    return fromMock ?? null;
  }
}
