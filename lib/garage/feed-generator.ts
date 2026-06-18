import type {
  BuildStage,
  GarageCar,
  GarageFeedItem,
  GarageFeedItemType,
  GarageProfile,
} from "@/lib/types";
import { isPublicGarage } from "@/lib/garage/garage-auth";
import { touchGarageActivity } from "@/lib/garage/garage-activity";
import { createGarageFeedItem } from "@/lib/repositories/garage-feed";
import { getGarageById } from "@/lib/repositories/garages";

export type EmitGarageFeedInput = {
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
  dedupeKey?: string;
};

function feedLog(message: string, error?: unknown): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[ShiftIt feed] ${message}`, error ?? "");
  }
}

export async function emitGarageFeedEvent(input: EmitGarageFeedInput): Promise<void> {
  try {
    const garage = await getGarageById(input.garageId);
    if (!garage || !isPublicGarage(garage)) return;

    const item = await createGarageFeedItem({
      garageId: input.garageId,
      carId: input.carId,
      ownerUid: input.ownerUid,
      type: input.type,
      title: input.title,
      body: input.body,
      imageUrl: input.imageUrl,
      relatedModId: input.relatedModId,
      relatedUpdateId: input.relatedUpdateId,
      horsepowerSnapshot: input.horsepowerSnapshot,
      buildStageSnapshot: input.buildStageSnapshot,
      visibility: "public",
      dedupeKey: input.dedupeKey,
    });

    await touchGarageActivity(input.garageId, item.createdAt);
  } catch (error) {
    feedLog("Feed item creation failed (non-blocking).", error);
  }
}

export function carTitle(car: GarageCar | null | undefined): string {
  if (!car) return "Build";
  return [car.year, car.make, car.model].filter(Boolean).join(" ") || "Build";
}

export function garageDisplayLabel(garage: GarageProfile): string {
  return garage.displayName.trim() || "Garage";
}

export type FeedFilterCategory =
  | "all"
  | "mods"
  | "progress"
  | "horsepower"
  | "photos"
  | "milestones";

const MOD_TYPES: GarageFeedItemType[] = ["mod_added", "mod_installed"];
const PROGRESS_TYPES: GarageFeedItemType[] = ["progress_update", "milestone"];
const PHOTO_TYPES: GarageFeedItemType[] = ["photo_updated"];
const MILESTONE_TYPES: GarageFeedItemType[] = ["milestone"];

export function filterFeedItems(
  items: GarageFeedItem[],
  filter: FeedFilterCategory
): GarageFeedItem[] {
  if (filter === "all") return items;
  if (filter === "mods") return items.filter((i) => MOD_TYPES.includes(i.type));
  if (filter === "progress") {
    return items.filter((i) => PROGRESS_TYPES.includes(i.type));
  }
  if (filter === "horsepower") {
    return items.filter(
      (i) => i.type === "horsepower_updated" || i.horsepowerSnapshot != null
    );
  }
  if (filter === "photos") return items.filter((i) => PHOTO_TYPES.includes(i.type));
  if (filter === "milestones") {
    return items.filter((i) => MILESTONE_TYPES.includes(i.type));
  }
  return items;
}

export function feedItemUsesImage(item: GarageFeedItem): boolean {
  return Boolean(item.imageUrl);
}
