import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { assertGarageOwner, GarageMutationError } from "@/lib/garage/garage-auth";
import {
  carTitle,
  emitGarageFeedEvent,
} from "@/lib/garage/feed-generator";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  getMockGarageCars,
  setMockGarageCar,
} from "@/lib/mock-data/garage-store";
import type { BuildStage, GarageCar } from "@/lib/types";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";
import { updateGarage } from "@/lib/repositories/garages";

export type CreateGarageCarInput = {
  garageId: string;
  ownerUid: string;
  make: string;
  model: string;
  year?: string;
  trim?: string;
  generation?: string;
  drivetrain?: string;
  transmission?: string;
  engine?: string;
  horsepower?: number;
  torqueNm?: number;
  buildStage?: BuildStage;
  buildSummary?: string;
  tags?: string[];
};

export async function getGarageCarById(carId: string): Promise<GarageCar | null> {
  const mock = getMockGarageCars().find((c) => c.id === carId);
  if (!db) return mock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.garageCars, carId));
    if (!snap.exists()) return mock ?? null;
    return { id: snap.id, ...snap.data() } as GarageCar;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garageCars, error);
    return mock ?? null;
  }
}

export async function getPrimaryCarByGarageId(
  garageId: string
): Promise<GarageCar | null> {
  const mockCars = getMockGarageCars().filter((c) => c.garageId === garageId);
  if (!db) {
    return mockCars.find((c) => c.status !== "archived") ?? mockCars[0] ?? null;
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.garageCars),
      where("garageId", "==", garageId)
    );
    const snap = await getDocs(q);
    const cars = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GarageCar);
    const merged = cars.length > 0 ? cars : mockCars;
    return merged.find((c) => c.status !== "archived") ?? merged[0] ?? null;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.garageCars, error);
    return mockCars.find((c) => c.status !== "archived") ?? mockCars[0] ?? null;
  }
}

export async function createPrimaryGarageCar(
  input: CreateGarageCarInput
): Promise<GarageCar> {
  const existing = await getPrimaryCarByGarageId(input.garageId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const id = generateId("car");
  const car: GarageCar = {
    id,
    garageId: input.garageId,
    ownerUid: input.ownerUid,
    make: input.make.trim(),
    model: input.model.trim(),
    year: input.year?.trim(),
    trim: input.trim?.trim(),
    generation: input.generation?.trim(),
    drivetrain: input.drivetrain?.trim(),
    transmission: input.transmission?.trim(),
    engine: input.engine?.trim(),
    horsepower: input.horsepower,
    torqueNm: input.torqueNm,
    buildStage: input.buildStage,
    buildSummary: input.buildSummary?.trim(),
    tags: input.tags?.map((t) => t.trim().toLowerCase()).filter(Boolean),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockGarageCar(car);
    await updateGarage(input.ownerUid, { primaryCarId: id });
    return car;
  }

  await setDoc(
    doc(db, COLLECTIONS.garageCars, id),
    sanitizeFirestoreData(car as unknown as Record<string, unknown>)
  );
  await updateGarage(input.ownerUid, { primaryCarId: id });
  return car;
}

export async function updateGarageCar(
  carId: string,
  ownerUid: string,
  patch: Partial<Omit<GarageCar, "id" | "garageId" | "ownerUid" | "createdAt">>,
  isAdmin = false
): Promise<GarageCar> {
  const existing = await getGarageCarById(carId);
  if (!existing) throw new GarageMutationError("Car not found.");
  assertGarageOwner(existing.ownerUid, ownerUid, isAdmin);

  const updated: GarageCar = {
    ...existing,
    ...patch,
    id: existing.id,
    garageId: existing.garageId,
    ownerUid: existing.ownerUid,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    setMockGarageCar(updated);
    void maybeEmitCarFeedEvents(existing, updated);
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.garageCars, carId),
    sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
    { merge: true }
  );

  void maybeEmitCarFeedEvents(existing, updated);
  return updated;
}

function maybeEmitCarFeedEvents(before: GarageCar, after: GarageCar): void {
  if (
    after.horsepower != null &&
    before.horsepower !== after.horsepower
  ) {
    void emitGarageFeedEvent({
      garageId: after.garageId,
      carId: after.id,
      ownerUid: after.ownerUid,
      type: "horsepower_updated",
      title: `${carTitle(after)} horsepower updated`,
      body: `${before.horsepower ?? "—"} → ${after.horsepower} hp`,
      horsepowerSnapshot: after.horsepower,
      dedupeKey: `hp_${after.horsepower}`,
    });
  }

  if (after.buildStage && before.buildStage !== after.buildStage) {
    void emitGarageFeedEvent({
      garageId: after.garageId,
      carId: after.id,
      ownerUid: after.ownerUid,
      type: "build_stage_updated",
      title: `${carTitle(after)} build stage updated`,
      body: `${before.buildStage ?? "stock"} → ${after.buildStage}`,
      buildStageSnapshot: after.buildStage,
      dedupeKey: `stage_${after.buildStage}`,
    });
  }

  if (
    after.primaryImageUrl &&
    before.primaryImageUrl !== after.primaryImageUrl
  ) {
    void emitGarageFeedEvent({
      garageId: after.garageId,
      carId: after.id,
      ownerUid: after.ownerUid,
      type: "photo_updated",
      title: `${carTitle(after)} photo updated`,
      imageUrl: after.primaryImageUrl,
      dedupeKey: after.imageUpdatedAt ?? after.primaryImageStoragePath ?? after.id,
    });
  }
}

export async function publishGarageCar(
  carId: string,
  ownerUid: string,
  isAdmin = false
): Promise<GarageCar> {
  return updateGarageCar(carId, ownerUid, { status: "published" }, isAdmin);
}

export type GarageCarImageUpdate = {
  primaryImageUrl: string;
  primaryImageStoragePath: string;
  imageSizeBytes: number;
  imageContentType: string;
  imageUpdatedAt: string;
};

export async function updateGarageCarImage(
  carId: string,
  ownerUid: string,
  image: GarageCarImageUpdate,
  isAdmin = false
): Promise<GarageCar> {
  return updateGarageCar(carId, ownerUid, image, isAdmin);
}
