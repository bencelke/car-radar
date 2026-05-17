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
import { mockShops } from "@/lib/mock-data/seeds";
import type { CarShop } from "@/lib/types";
import {
  filterApproved,
  logRepositoryFallback,
  sortFeaturedFirst,
} from "@/lib/repositories/utils";

async function fetchApprovedFromFirestore(): Promise<CarShop[]> {
  if (!db) return filterApproved(mockShops);

  const q = query(
    collection(db, COLLECTIONS.carShops),
    where("status", "==", "approved")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as CarShop
  );
}

export async function getApprovedShops(): Promise<CarShop[]> {
  try {
    const shops = await fetchApprovedFromFirestore();
    return sortFeaturedFirst(shops.length > 0 ? shops : filterApproved(mockShops));
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.carShops, error);
    return sortFeaturedFirst(filterApproved(mockShops));
  }
}

export async function getFeaturedShops(): Promise<CarShop[]> {
  const shops = await getApprovedShops();
  return shops.filter((shop) => shop.featured);
}

export async function getShopById(id: string): Promise<CarShop | null> {
  const fromMock = mockShops.find((s) => s.id === id && s.status === "approved");
  if (!db) return fromMock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.carShops, id));
    if (!snap.exists()) return fromMock ?? null;
    const shop = { id: snap.id, ...snap.data() } as CarShop;
    return shop.status === "approved" ? shop : null;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.carShops, error);
    return fromMock ?? null;
  }
}
