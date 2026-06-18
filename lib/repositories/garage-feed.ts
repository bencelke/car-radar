import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  where,
} from "firebase/firestore";

import { assertGarageOwner, GarageMutationError } from "@/lib/garage/garage-auth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  deleteMockGarageFeedItem,
  getMockGarageFeedItems,
  setMockGarageFeedItem,
} from "@/lib/mock-data/garage-social-store";
import type {
  BuildStage,
  GarageFeedItem,
  GarageFeedItemType,
  GarageFeedVisibility,
} from "@/lib/types";
import { getFollowingGarageIds } from "@/lib/repositories/garage-follows";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

const DEFAULT_LIMIT = 20;
const IN_QUERY_BATCH = 10;

export type CreateGarageFeedItemInput = {
  garageId: string;
  carId?: string;
  ownerUid: string;
  type: GarageFeedItemType;
  title: string;
  body?: string;
  imageUrl?: string;
  relatedModId?: string;
  relatedUpdateId?: string;
  horsepowerSnapshot?: number;
  buildStageSnapshot?: BuildStage | string;
  visibility?: GarageFeedVisibility;
  dedupeKey?: string;
};

export type FeedPage = {
  items: GarageFeedItem[];
  nextCursor: string | null;
};

function sortFeedItems(items: GarageFeedItem[]): GarageFeedItem[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function feedDocId(input: CreateGarageFeedItemInput): string {
  if (input.dedupeKey) {
    return `${input.garageId}_${input.type}_${input.dedupeKey}`;
  }
  return generateId("feed");
}

export async function createGarageFeedItem(
  input: CreateGarageFeedItemInput
): Promise<GarageFeedItem> {
  const now = new Date().toISOString();
  const id = feedDocId(input);
  const item: GarageFeedItem = {
    id,
    garageId: input.garageId,
    carId: input.carId,
    ownerUid: input.ownerUid,
    type: input.type,
    title: input.title.trim(),
    body: input.body?.trim(),
    imageUrl: input.imageUrl,
    relatedModId: input.relatedModId,
    relatedUpdateId: input.relatedUpdateId,
    horsepowerSnapshot: input.horsepowerSnapshot,
    buildStageSnapshot: input.buildStageSnapshot,
    visibility: input.visibility ?? "public",
    dedupeKey: input.dedupeKey,
    createdAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockGarageFeedItem(item);
    return item;
  }

  await setDoc(
    doc(db, COLLECTIONS.garageFeedItems, id),
    sanitizeFirestoreData(item as unknown as Record<string, unknown>),
    { merge: Boolean(input.dedupeKey) }
  );
  return item;
}

export async function getPublicGarageFeed(
  max = DEFAULT_LIMIT,
  cursor?: string | null
): Promise<FeedPage> {
  const mock = sortFeedItems(
    getMockGarageFeedItems().filter((i) => i.visibility === "public")
  );

  if (!db) {
    const start = cursor ? mock.findIndex((i) => i.id === cursor) + 1 : 0;
    const slice = mock.slice(start, start + max);
    return {
      items: slice,
      nextCursor:
        start + max < mock.length ? slice[slice.length - 1]?.id ?? null : null,
    };
  }

  try {
    let q = query(
      collection(db, COLLECTIONS.garageFeedItems),
      where("visibility", "==", "public"),
      orderBy("createdAt", "desc"),
      limit(max)
    );

    if (cursor) {
      const cursorDoc = await getDoc(doc(db, COLLECTIONS.garageFeedItems, cursor));
      if (cursorDoc.exists()) {
        q = query(
          collection(db, COLLECTIONS.garageFeedItems),
          where("visibility", "==", "public"),
          orderBy("createdAt", "desc"),
          startAfter(cursorDoc),
          limit(max)
        );
      }
    }

    const snap = await getDocs(q);
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as GarageFeedItem
    );
    const merged = items.length > 0 ? items : mock.slice(0, max);
    return {
      items: merged,
      nextCursor:
        snap.docs.length === max
          ? snap.docs[snap.docs.length - 1]?.id ?? null
          : null,
    };
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garageFeedItems, error);
    return { items: mock.slice(0, max), nextCursor: null };
  }
}

async function queryFeedForGarageIds(
  garageIds: string[],
  max: number
): Promise<GarageFeedItem[]> {
  if (garageIds.length === 0) return [];

  if (!db) {
    return sortFeedItems(
      getMockGarageFeedItems().filter((i) => garageIds.includes(i.garageId))
    ).slice(0, max);
  }

  const batches = chunk(garageIds, IN_QUERY_BATCH);
  const collected: GarageFeedItem[] = [];

  for (const batch of batches) {
    try {
      const q = query(
        collection(db, COLLECTIONS.garageFeedItems),
        where("garageId", "in", batch),
        where("visibility", "==", "public"),
        orderBy("createdAt", "desc"),
        limit(max)
      );
      const snap = await getDocs(q);
      collected.push(
        ...snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GarageFeedItem)
      );
    } catch (error) {
      logRepositoryFallback(COLLECTIONS.garageFeedItems, error);
    }
  }

  if (collected.length === 0) {
    return sortFeedItems(
      getMockGarageFeedItems().filter((i) => garageIds.includes(i.garageId))
    ).slice(0, max);
  }

  return sortFeedItems(collected).slice(0, max);
}

export async function getGarageFeedForUser(
  userUid: string,
  max = DEFAULT_LIMIT,
  cursor?: string | null
): Promise<FeedPage> {
  const garageIds = await getFollowingGarageIds(userUid);
  let items = await queryFeedForGarageIds(garageIds, max + 1);

  if (cursor) {
    const idx = items.findIndex((i) => i.id === cursor);
    items = idx >= 0 ? items.slice(idx + 1) : items;
  }

  const page = items.slice(0, max);
  return {
    items: page,
    nextCursor: items.length > max ? page[page.length - 1]?.id ?? null : null,
  };
}

export async function getGarageFeedByGarageId(
  garageId: string,
  max = DEFAULT_LIMIT
): Promise<GarageFeedItem[]> {
  if (!db) {
    return sortFeedItems(
      getMockGarageFeedItems().filter((i) => i.garageId === garageId)
    ).slice(0, max);
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.garageFeedItems),
      where("garageId", "==", garageId),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GarageFeedItem);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garageFeedItems, error);
    return sortFeedItems(
      getMockGarageFeedItems().filter((i) => i.garageId === garageId)
    ).slice(0, max);
  }
}

export async function deleteGarageFeedItem(
  id: string,
  actorUid: string,
  isAdmin = false
): Promise<void> {
  const mock = getMockGarageFeedItems().find((i) => i.id === id);

  if (!isFirebaseConfigured || !db) {
    if (!mock) return;
    if (mock.ownerUid !== actorUid && !isAdmin) {
      throw new GarageMutationError("Not allowed.");
    }
    deleteMockGarageFeedItem(id);
    return;
  }

  const ref = doc(db, COLLECTIONS.garageFeedItems, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const item = { id: snap.id, ...snap.data() } as GarageFeedItem;
  assertGarageOwner(item.ownerUid, actorUid, isAdmin);
  await deleteDoc(ref);
}
