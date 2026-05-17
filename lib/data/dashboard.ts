import {
  buildMapPins,
  communityToCommunityItem,
  eventToEventItem,
  shopToPlace,
  shopToShopItem,
  shopsToPlaces,
  zoneToClubArea,
} from "@/lib/mappers/ui";
import {
  getApprovedCommunityZones,
  getApprovedCommunities,
  getApprovedShops,
  getUpcomingEvents,
} from "@/lib/repositories";
import type {
  ClubArea,
  CommunityItem,
  EventItem,
  MapPin,
  Place,
  ShopItem,
} from "@/lib/types";

export type DashboardData = {
  shops: ShopItem[];
  events: EventItem[];
  communities: CommunityItem[];
  clubAreas: ClubArea[];
  places: Place[];
  mapPins: MapPin[];
  selectedPlaceId: string;
};

export async function loadDashboardData(): Promise<DashboardData> {
  const [shops, events, communities, zones] = await Promise.all([
    getApprovedShops(),
    getUpcomingEvents(),
    getApprovedCommunities(),
    getApprovedCommunityZones(),
  ]);

  const selectedPlaceId = "kmc-performance";

  return {
    shops: shops.map(shopToShopItem),
    events: events.map(eventToEventItem),
    communities: communities.map(communityToCommunityItem),
    clubAreas: zones.map(zoneToClubArea),
    places: shopsToPlaces(shops),
    mapPins: buildMapPins(shops, events, communities),
    selectedPlaceId,
  };
}

export { shopToPlace };
