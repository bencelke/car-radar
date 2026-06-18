import type { GarageProfile } from "@/lib/types";

export class GarageMutationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GarageMutationError";
  }
}

export function isPublicGarage(garage: GarageProfile): boolean {
  return garage.visibility === "public" && garage.status === "published";
}

export function canEditGarage(
  garage: GarageProfile,
  actorUid: string | undefined,
  isAdmin: boolean
): boolean {
  if (!actorUid) return false;
  if (isAdmin) return true;
  return garage.ownerUid === actorUid;
}

export function assertGarageOwner(
  ownerUid: string,
  actorUid: string,
  isAdmin: boolean
): void {
  if (ownerUid !== actorUid && !isAdmin) {
    throw new GarageMutationError("You can only edit your own garage.");
  }
}