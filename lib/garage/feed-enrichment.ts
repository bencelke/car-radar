import type { GarageCar, GarageFeedItem, GarageProfile } from "@/lib/types";
import { getPrimaryCarByGarageId } from "@/lib/repositories/garage-cars";
import { getGarageById } from "@/lib/repositories/garages";

export type EnrichedFeedItem = {
  item: GarageFeedItem;
  garage: GarageProfile | null;
  car: GarageCar | null;
};

export async function enrichFeedItems(
  items: GarageFeedItem[]
): Promise<EnrichedFeedItem[]> {
  const garageCache = new Map<string, GarageProfile | null>();
  const carCache = new Map<string, GarageCar | null>();

  async function garage(id: string): Promise<GarageProfile | null> {
    if (!garageCache.has(id)) {
      garageCache.set(id, await getGarageById(id));
    }
    return garageCache.get(id) ?? null;
  }

  async function carForGarage(
    garageId: string,
    carId?: string
  ): Promise<GarageCar | null> {
    const key = carId ?? garageId;
    if (!carCache.has(key)) {
      if (carId) {
        const { getGarageCarById } = await import("@/lib/repositories/garage-cars");
        carCache.set(key, await getGarageCarById(carId));
      } else {
        carCache.set(key, await getPrimaryCarByGarageId(garageId));
      }
    }
    return carCache.get(key) ?? null;
  }

  return Promise.all(
    items.map(async (item) => ({
      item,
      garage: await garage(item.garageId),
      car: await carForGarage(item.garageId, item.carId),
    }))
  );
}

export type FollowingGarageCardData = {
  garage: GarageProfile;
  car: GarageCar | null;
};

export async function loadFollowingGarageCards(
  garages: GarageProfile[]
): Promise<FollowingGarageCardData[]> {
  return Promise.all(
    garages.map(async (garage) => ({
      garage,
      car: await getPrimaryCarByGarageId(garage.id),
    }))
  );
}
