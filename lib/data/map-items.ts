import { categoryToLabel } from "@/lib/mappers/ui";
import { getEntitySlug } from "@/lib/utils/slug";
import {
  offsetCoordinates,
  resolveCityCoordinates,
} from "@/lib/map/map-utils";
import { getApprovedCommunityZones } from "@/lib/repositories/community-zones";
import { getApprovedClubs } from "@/lib/repositories/clubs";
import { getApprovedEvents } from "@/lib/repositories/events";
import { getApprovedShops } from "@/lib/repositories/shops";
import type { CarEvent, MapItem } from "@/lib/types";

function coordsFromRecord(
  lat?: number,
  lng?: number,
  city?: string,
  area?: string,
  id?: string,
  index = 0
): { lat: number; lng: number } {
  if (lat != null && lng != null) {
    return { lat, lng };
  }
  const base = resolveCityCoordinates(city ?? "Kaiserslautern", area);
  if (id) {
    return offsetCoordinates(id, base.lat, base.lng, index);
  }
  return base;
}

/** Public map markers — clubs, events, shops, zones only (no member cars). */
export async function loadMapItems(): Promise<MapItem[]> {
  const [clubs, shops, events, zones] = await Promise.all([
    getApprovedClubs(),
    getApprovedShops(),
    getApprovedEvents(),
    getApprovedCommunityZones(),
  ]);

  const clubById = new Map(clubs.map((c) => [c.id, c]));
  const items: MapItem[] = [];

  for (const shop of shops) {
    const { lat, lng } = coordsFromRecord(
      shop.lat,
      shop.lng,
      shop.city,
      undefined,
      shop.id
    );
    items.push({
      id: `shop-${shop.id}`,
      title: shop.name,
      type: "shop",
      category: categoryToLabel(shop.category),
      city: shop.city,
      country: shop.country,
      lat,
      lng,
      description: shop.description,
      instagram: shop.instagram,
      website: shop.website,
      verified: shop.verified,
      featured: shop.featured,
      createdAt: shop.createdAt,
      tags: shop.services,
      metadata: {
        entityId: shop.id,
        slug: getEntitySlug(shop),
        services: shop.services?.join(", "),
        rating: shop.rating ?? 0,
        reviewCount: shop.reviewCount ?? 0,
        openNow: true,
        sponsorLevel: shop.sponsorLevel ?? "",
      },
    });
  }

  for (const event of events) {
    const { lat, lng } = coordsFromRecord(
      event.lat,
      event.lng,
      event.city,
      event.area,
      event.id
    );
    items.push({
      id: `event-${event.id}`,
      title: event.title,
      type: "event",
      category: event.type,
      city: event.city,
      country: event.country,
      area: event.area,
      lat,
      lng,
      description: event.description,
      verified: event.verified,
      featured: event.featured,
      createdAt: event.createdAt ?? event.startTime,
      metadata: {
        entityId: event.id,
        slug: getEntitySlug(event),
        startTime: event.startTime,
        endTime: event.endTime ?? "",
        interestedCount: event.interestedCount ?? 0,
        goingCount: event.goingCount ?? 0,
        clubId: event.clubId ?? "",
        clubName: event.clubName ?? "",
        cancelled: event.status === "cancelled",
        organizerName: event.organizerName ?? "",
        organizerInstagram: event.organizerInstagram ?? "",
      },
    });
  }

  clubs.forEach((club, i) => {
    const { lat, lng } = coordsFromRecord(
      club.lat,
      club.lng,
      club.city,
      club.area,
      club.id,
      i
    );
    items.push({
      id: `club-${club.id}`,
      title: club.name,
      type: "club",
      category: club.type,
      city: club.city,
      country: club.country,
      area: club.area,
      lat,
      lng,
      description: club.description,
      instagram: club.instagram,
      website: club.website,
      verified: club.verified,
      featured: club.featured,
      tags: club.tags,
      createdAt: club.createdAt,
      metadata: {
        entityId: club.id,
        slug: club.slug,
        memberCount: club.memberCount ?? 0,
      },
    });
  });

  for (const zone of zones) {
    if (zone.centerLat == null || zone.centerLng == null) continue;
    const relatedClub = zone.communityId
      ? clubById.get(zone.communityId)
      : undefined;
    items.push({
      id: `zone-${zone.id}`,
      title: zone.name,
      type: "zone",
      category: zone.type,
      city: zone.city,
      country: zone.country,
      lat: zone.centerLat,
      lng: zone.centerLng,
      description: zone.description,
      instagram: zone.instagram,
      website: zone.website,
      verified: zone.verified,
      radiusMeters: zone.radiusMeters ?? 600,
      metadata: {
        communityId: zone.communityId ?? "",
        clubName: relatedClub?.name ?? zone.name,
      },
    });
  }

  return items;
}

export function eventsToMapItems(events: CarEvent[]): MapItem[] {
  return events
    .filter((e) => e.status === "approved")
    .map((event, index) => {
      const { lat, lng } = coordsFromRecord(
        event.lat,
        event.lng,
        event.city,
        event.area,
        event.id,
        index
      );
      return {
        id: `event-${event.id}`,
        title: event.title,
        type: "event" as const,
        category: event.type,
        city: event.city,
        country: event.country,
        area: event.area,
        lat,
        lng,
        description: event.description,
        verified: event.verified,
        featured: event.featured,
        createdAt: event.createdAt ?? event.startTime,
        metadata: {
          entityId: event.id,
          slug: getEntitySlug(event),
          startTime: event.startTime,
          endTime: event.endTime ?? "",
          interestedCount: event.interestedCount ?? 0,
          goingCount: event.goingCount ?? 0,
          clubId: event.clubId ?? "",
          clubName: event.clubName ?? "",
        },
      };
    });
}
