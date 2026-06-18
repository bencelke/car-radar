import type { GarageProfile } from "@/lib/types";
import { isPublicGarage } from "@/lib/garage/garage-auth";

export function garageFollowDocId(followerUid: string, garageId: string): string {
  return `${followerUid}_${garageId}`;
}

export function canFollowGarage(
  garage: GarageProfile,
  followerUid: string | undefined
): boolean {
  if (!followerUid) return false;
  if (garage.ownerUid === followerUid) return false;
  if (garage.visibility === "private") return false;
  if (!isPublicGarage(garage)) return false;
  return true;
}

export function garageFollowLoginNext(path: string): string {
  return `/login?next=${encodeURIComponent(path)}`;
}
