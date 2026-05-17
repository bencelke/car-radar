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
import { mockCommunities } from "@/lib/mock-data/seeds";
import type { Community } from "@/lib/types";
import {
  filterApproved,
  logRepositoryFallback,
  sortFeaturedFirst,
} from "@/lib/repositories/utils";

async function fetchApprovedFromFirestore(): Promise<Community[]> {
  if (!db) return filterApproved(mockCommunities);

  const q = query(
    collection(db, COLLECTIONS.communities),
    where("status", "==", "approved")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Community
  );
}

export async function getApprovedCommunities(): Promise<Community[]> {
  try {
    const communities = await fetchApprovedFromFirestore();
    return sortFeaturedFirst(
      communities.length > 0 ? communities : filterApproved(mockCommunities)
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.communities, error);
    return sortFeaturedFirst(filterApproved(mockCommunities));
  }
}

export async function getCommunityById(id: string): Promise<Community | null> {
  const fromMock = mockCommunities.find(
    (c) => c.id === id && c.status === "approved"
  );
  if (!db) return fromMock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.communities, id));
    if (!snap.exists()) return fromMock ?? null;
    const community = { id: snap.id, ...snap.data() } as Community;
    return community.status === "approved" ? community : null;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.communities, error);
    return fromMock ?? null;
  }
}
