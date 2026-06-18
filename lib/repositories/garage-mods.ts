import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
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
  deleteMockGarageMod,
  getMockGarageMods,
  setMockGarageMod,
} from "@/lib/mock-data/garage-store";
import type { GarageMod, GarageModCategory, GarageModStatus } from "@/lib/types";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

export type CreateGarageModInput = {
  carId: string;
  ownerUid: string;
  category: GarageModCategory;
  name: string;
  brand?: string;
  description?: string;
  installedAt?: string;
  status?: GarageModStatus;
};

export async function getGarageMods(carId: string): Promise<GarageMod[]> {
  const mock = getMockGarageMods()
    .filter((m) => m.carId === carId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (!db) return mock;

  try {
    const q = query(
      collection(db, COLLECTIONS.garageMods),
      where("carId", "==", carId)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GarageMod);
    const merged = items.length > 0 ? items : mock;
    return merged.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garageMods, error);
    return mock;
  }
}

export async function getGarageModById(modId: string): Promise<GarageMod | null> {
  const mock = getMockGarageMods().find((m) => m.id === modId);
  if (!db) return mock ?? null;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.garageMods, modId));
    if (!snap.exists()) return mock ?? null;
    return { id: snap.id, ...snap.data() } as GarageMod;
  } catch {
    return mock ?? null;
  }
}

export async function createGarageMod(input: CreateGarageModInput): Promise<GarageMod> {
  const now = new Date().toISOString();
  const id = generateId("mod");
  const mod: GarageMod = {
    id,
    carId: input.carId,
    ownerUid: input.ownerUid,
    category: input.category,
    name: input.name.trim(),
    brand: input.brand?.trim(),
    description: input.description?.trim(),
    installedAt: input.installedAt,
    status: input.status ?? "planned",
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockGarageMod(mod);
    void emitModFeed(mod, "mod_added");
    return mod;
  }

  await setDoc(
    doc(db, COLLECTIONS.garageMods, id),
    sanitizeFirestoreData(mod as unknown as Record<string, unknown>)
  );
  void emitModFeed(mod, "mod_added");
  return mod;
}

async function emitModFeed(
  mod: GarageMod,
  type: "mod_added" | "mod_installed"
): Promise<void> {
  const car = await getGarageCarById(mod.carId);
  if (!car) return;
  void emitGarageFeedEvent({
    garageId: car.garageId,
    carId: car.id,
    ownerUid: mod.ownerUid,
    type,
    title:
      type === "mod_installed"
        ? `${mod.name} installed on ${carTitle(car)}`
        : `${mod.name} added to ${carTitle(car)}`,
    body: mod.brand,
    relatedModId: mod.id,
    dedupeKey: `${type}_${mod.id}`,
  });
}

export async function updateGarageMod(
  modId: string,
  ownerUid: string,
  patch: Partial<
    Pick<
      GarageMod,
      "category" | "name" | "brand" | "description" | "installedAt" | "status"
    >
  >,
  isAdmin = false
): Promise<GarageMod> {
  const record = await getGarageModById(modId);
  if (!record) throw new GarageMutationError("Mod not found.");
  assertGarageOwner(record.ownerUid, ownerUid, isAdmin);

  const updated: GarageMod = {
    ...record,
    ...patch,
    id: record.id,
    ownerUid: record.ownerUid,
    carId: record.carId,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    setMockGarageMod(updated);
    if (record.status !== "installed" && updated.status === "installed") {
      void emitModFeed(updated, "mod_installed");
    }
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.garageMods, modId),
    sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
    { merge: true }
  );
  if (record.status !== "installed" && updated.status === "installed") {
    void emitModFeed(updated, "mod_installed");
  }
  return updated;
}

export async function deleteGarageMod(
  modId: string,
  ownerUid: string,
  isAdmin = false
): Promise<void> {
  const record = await getGarageModById(modId);
  if (!record) throw new GarageMutationError("Mod not found.");
  assertGarageOwner(record.ownerUid, ownerUid, isAdmin);

  if (!isFirebaseConfigured || !db) {
    deleteMockGarageMod(modId);
    return;
  }

  await deleteDoc(doc(db, COLLECTIONS.garageMods, modId));
}
