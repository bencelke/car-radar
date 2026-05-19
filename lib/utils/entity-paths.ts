import { metaString } from "@/lib/map/map-utils";
import type { CarEvent, CarShop, Club, ClubMember } from "@/lib/types";
import type { MapItem } from "@/lib/types/map";
import { citySlug, getEntitySlug } from "@/lib/utils/slug";

export function shopDetailPath(shop: CarShop): string {
  return `/shops/${getEntitySlug(shop)}`;
}

export function eventDetailPath(event: CarEvent): string {
  return `/events/${getEntitySlug(event)}`;
}

export function clubDetailPath(club: Club): string {
  return `/clubs/${club.slug || getEntitySlug(club)}`;
}

export function memberDetailPath(member: ClubMember): string {
  return `/members/${member.id}`;
}

export function cityDetailPath(city: string): string {
  return `/cities/${citySlug(city)}`;
}

export function mapItemDetailPath(item: MapItem): string | null {
  const entityId =
    metaString(item, "entityId") ??
    item.id.replace(/^(shop|event|club|member|zone)-/, "");
  const slug = metaString(item, "slug") ?? entityId;

  switch (item.type) {
    case "shop":
      return `/shops/${slug}`;
    case "event":
      return `/events/${slug}`;
    case "club":
      return `/clubs/${slug}`;
    case "member":
      return `/members/${entityId}`;
    default:
      return null;
  }
}

export function correctionSubmitPath(
  targetType: "shop" | "event" | "club" | "member" | "zone",
  targetName: string,
  entityId?: string
): string {
  const params = new URLSearchParams({
    type: "correction",
    targetType,
    targetName,
  });
  if (entityId) params.set("entityId", entityId);
  return `/submit?${params.toString()}`;
}
