import type { GarageCar, GarageMod, GarageProfile } from "@/lib/types";

export type GarageCompletionInput = {
  garage: GarageProfile;
  car: GarageCar;
  modCount?: number;
};

/** Weighted profile completion — never used as a blocker. */
export function calculateGarageCompletion({
  garage,
  car,
  modCount = 0,
}: GarageCompletionInput): number {
  let score = 0;

  if (garage.displayName?.trim()) score += 10;
  if (car.make?.trim()) score += 15;
  if (car.model?.trim()) score += 15;
  if (car.primaryImageUrl?.trim()) score += 15;
  if (car.year?.trim()) score += 5;
  if (garage.instagramHandle?.trim()) score += 5;
  if (garage.city?.trim() || garage.country?.trim()) score += 5;
  if (car.horsepower != null || car.buildStage) score += 10;
  if (car.buildSummary?.trim()) score += 10;
  if (modCount > 0) score += 10;

  return Math.min(100, score);
}
