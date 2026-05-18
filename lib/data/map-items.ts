import { categoryToLabel } from "@/lib/mappers/ui";
import {
  offsetCoordinates,
  resolveCityCoordinates,
} from "@/lib/map/map-utils";
import { getApprovedCommunityZones } from "@/lib/repositories/community-zones";
import { getApprovedClubMembers } from "@/lib/repositories/club-members";
import { getApprovedClubs } from "@/lib/repositories/clubs";
import { getApprovedEvents } from "@/lib/repositories/events";
import { getApprovedShops } from "@/lib/repositories/shops";
import type { MapItem } from "@/lib/types";

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

export async function loadMapItems(): Promise<MapItem[]> {
  const [clubs, members, shops, events, zones] = await Promise.all([
    getApprovedClubs(),
    getApprovedClubMembers(),
    getApprovedShops(),
    getApprovedEvents(),
    getApprovedCommunityZones(),
  ]);

  const clubCoords = new Map(
    clubs.map((c) => {
      const coords = coordsFromRecord(c.lat, c.lng, c.city, c.area, c.id);
      return [c.id, coords] as const;
    })
  );

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
      metadata: { rating: shop.rating ?? 0 },
    });
  }

  for (const event of events) {
    const { lat, lng } = coordsFromRecord(
      event.lat,
      event.lng,
      event.city,
      undefined,
      event.id
    );
    items.push({
      id: `event-${event.id}`,
      title: event.title,
      type: "event",
      category: event.type,
      city: event.city,
      country: event.country,
      lat,
      lng,
      description: event.description,
      verified: event.verified,
      featured: event.featured,
      metadata: { interested: event.interestedCount ?? 0 },
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
      lat,
      lng,
      description: club.description,
      instagram: club.instagram,
      website: club.website,
      verified: club.verified,
      featured: club.featured,
      metadata: { slug: club.slug, memberCount: club.memberCount ?? 0 },
    });
  });

  members.forEach((member, i) => {
    const clubBase = clubCoords.get(member.clubId);
    const fallback = resolveCityCoordinates(member.city, member.area);
    const base = clubBase ?? fallback;
    const { lat, lng } =
      member.lat != null && member.lng != null
        ? { lat: member.lat, lng: member.lng }
        : offsetCoordinates(member.id, base.lat, base.lng, i + 3);
    const car = [member.carYear, member.carMake, member.carModel]
      .filter(Boolean)
      .join(" ");
    items.push({
      id: `member-${member.id}`,
      title: member.nickname ?? member.displayName,
      type: "member",
      category: car || "Member build",
      city: member.city,
      country: member.country,
      lat,
      lng,
      description: member.buildSummary ?? "",
      instagram: member.instagram,
      verified: member.verifiedByClub,
      featured: member.featured,
      metadata: {
        clubId: member.clubId,
        displayName: member.displayName,
      },
    });
  });

  for (const zone of zones) {
    if (zone.centerLat == null || zone.centerLng == null) continue;
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
      metadata: { communityId: zone.communityId ?? "" },
    });
  }

  return items;
}
