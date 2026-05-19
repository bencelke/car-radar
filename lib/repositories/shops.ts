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
import { getPublishedShops } from "@/lib/mock-data/published-store";
import { mockShops } from "@/lib/mock-data/seeds";
import type { CarShop } from "@/lib/types";
import {
  filterApproved,
  logRepositoryFallback,
  sortFeaturedFirst,
} from "@/lib/repositories/utils";
import { matchesSlugOrId } from "@/lib/utils/slug";

function approvedShopsWithPublished(): CarShop[] {
  return filterApproved([...getPublishedShops(), ...mockShops]);
}

async function fetchApprovedFromFirestore(): Promise<CarShop[]> {
  if (!db) return approvedShopsWithPublished();

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
    return sortFeaturedFirst(
      shops.length > 0 ? shops : approvedShopsWithPublished()
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.carShops, error);
    return sortFeaturedFirst(approvedShopsWithPublished());
  }
}

export async function getFeaturedShops(): Promise<CarShop[]> {
  const shops = await getApprovedShops();
  return shops.filter((shop) => shop.featured);
}

export async function getShopById(id: string): Promise<CarShop | null> {
  const fromMock = approvedShopsWithPublished().find((s) => s.id === id);
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

export async function getShopBySlug(slugOrId: string): Promise<CarShop | null> {
  const byId = await getShopById(slugOrId);
  if (byId && matchesSlugOrId(byId, slugOrId)) return byId;

  const shops = await getApprovedShops();
  return shops.find((shop) => matchesSlugOrId(shop, slugOrId)) ?? null;
}
