import type {
  BuildProgressUpdate,
  GarageCar,
  GarageMod,
  GarageProfile,
} from "@/lib/types";

const garages = new Map<string, GarageProfile>();
const cars = new Map<string, GarageCar>();
const mods = new Map<string, GarageMod>();
const updates = new Map<string, BuildProgressUpdate>();

export function getMockGarages(): GarageProfile[] {
  return [...garages.values()];
}

export function getMockGarageCars(): GarageCar[] {
  return [...cars.values()];
}

export function getMockGarageMods(): GarageMod[] {
  return [...mods.values()];
}

export function getMockGarageUpdates(): BuildProgressUpdate[] {
  return [...updates.values()];
}

export function setMockGarage(doc: GarageProfile): void {
  garages.set(doc.id, doc);
}

export function setMockGarageCar(doc: GarageCar): void {
  cars.set(doc.id, doc);
}

export function setMockGarageMod(doc: GarageMod): void {
  mods.set(doc.id, doc);
}

export function setMockGarageUpdate(doc: BuildProgressUpdate): void {
  updates.set(doc.id, doc);
}

export function deleteMockGarageMod(id: string): void {
  mods.delete(id);
}

export function deleteMockGarageUpdate(id: string): void {
  updates.delete(id);
}
