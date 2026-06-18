import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { assertGarageOwner, GarageMutationError } from "@/lib/garage/garage-auth";
import { carTitle, emitGarageFeedEvent } from "@/lib/garage/feed-generator";
import { getGarageCarById } from "@/lib/repositories/garage-cars";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  deleteMockGarageUpdate,
  getMockGarageUpdates,
  setMockGarageUpdate,
} from "@/lib/mock-data/garage-store";
import type { BuildProgressType, BuildProgressUpdate } from "@/lib/types";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

export type CreateBuildProgressInput = {
  carId: string;
  ownerUid: string;
  title: string;
  body?: string;
  type: BuildProgressType;
  relatedModId?: string;
  horsepowerSnapshot?: number;
};

export async function getBuildUpdates(
  carId: string,
  max = 50
): Promise<BuildProgressUpdate[]> {
  const mock = getMockGarageUpdates()
    .filter((u) => u.carId === carId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, max);

  if (!db) return mock;

  try {
    const q = query(
      collection(db, COLLECTIONS.garageUpdates),
      where("carId", "==", carId),
      orderBy("createdAt", "desc"),
      limit(max)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as BuildProgressUpdate
    );
    return items.length > 0 ? items : mock;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garageUpdates, error);
    return mock;
  }
}

export async function createBuildProgressUpdate(
  input: CreateBuildProgressInput
): Promise<BuildProgressUpdate> {
  const now = new Date().toISOString();
  const id = generateId("update");
  const update: BuildProgressUpdate = {
    id,
    carId: input.carId,
    ownerUid: input.ownerUid,
    title: input.title.trim(),
    body: input.body?.trim(),
    type: input.type,
    relatedModId: input.relatedModId,
    horsepowerSnapshot: input.horsepowerSnapshot,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockGarageUpdate(update);
    void emitProgressFeed(update);
    return update;
  }

  await setDoc(
    doc(db, COLLECTIONS.garageUpdates, id),
    sanitizeFirestoreData(update as unknown as Record<string, unknown>)
  );
  void emitProgressFeed(update);
  return update;
}

async function emitProgressFeed(update: BuildProgressUpdate): Promise<void> {
  const car = await getGarageCarById(update.carId);
  if (!car) return;
  const isMilestone = update.type === "milestone";
  void emitGarageFeedEvent({
    garageId: car.garageId,
    carId: car.id,
    ownerUid: update.ownerUid,
    type: isMilestone ? "milestone" : "progress_update",
    title: update.title,
    body: update.body,
    relatedUpdateId: update.id,
    horsepowerSnapshot: update.horsepowerSnapshot,
    dedupeKey: update.id,
  });
}

export async function updateBuildProgressUpdate(
  id: string,
  ownerUid: string,
  patch: Partial<Pick<BuildProgressUpdate, "title" | "body" | "type" | "horsepowerSnapshot">>,
  isAdmin = false
): Promise<BuildProgressUpdate> {
  const existing = getMockGarageUpdates().find((u) => u.id === id);
  if (!existing) throw new GarageMutationError("Update not found.");
  assertGarageOwner(existing.ownerUid, ownerUid, isAdmin);

  const updated: BuildProgressUpdate = {
    ...existing,
    ...patch,
    id: existing.id,
    ownerUid: existing.ownerUid,
    carId: existing.carId,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    setMockGarageUpdate(updated);
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.garageUpdates, id),
    sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
    { merge: true }
  );
  return updated;
}

export async function deleteBuildProgressUpdate(
  id: string,
  ownerUid: string,
  isAdmin = false
): Promise<void> {
  const existing = getMockGarageUpdates().find((u) => u.id === id);
  if (!existing) throw new GarageMutationError("Update not found.");
  assertGarageOwner(existing.ownerUid, ownerUid, isAdmin);

  if (!isFirebaseConfigured || !db) {
    deleteMockGarageUpdate(id);
    return;
  }

  await deleteDoc(doc(db, COLLECTIONS.garageUpdates, id));
}
