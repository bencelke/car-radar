import {
  buildMapPins,
  communityToCommunityItem,
  eventToEventItem,
  shopToShopItem,
  shopsToPlaces,
  zoneToClubArea,
} from "@/lib/mappers/ui";
import { loadMapItems } from "@/lib/data/map-items";
import {
  getApprovedClubMembers,
  getApprovedClubs,
  getApprovedCommunityZones,
  getApprovedCommunities,
  getApprovedShops,
  getUpcomingEvents,
} from "@/lib/repositories";
import type { CarEvent, CarShop, Club } from "@/lib/types";
import type {
  ClubArea,
  CommunityItem,
  EventItem,
  MapItem,
  MapPin,
  Place,
  ShopItem,
} from "@/lib/types";

export type HomeSceneStats = {
  eventsThisWeek: number;
  clubsMapped: number;
  shopsListed: number;
  memberGarages: number;
};

export type DashboardData = {
  shops: ShopItem[];
  events: EventItem[];
  communities: CommunityItem[];
  clubAreas: ClubArea[];
  places: Place[];
  mapPins: MapPin[];
  mapItems: MapItem[];
  selectedPlaceId: string;
  stats: HomeSceneStats;
  featuredEvent: CarEvent | null;
  rawEvents: CarEvent[];
  rawShops: CarShop[];
  rawClubs: Club[];
};

function countEventsThisWeek(events: CarEvent[]): number {
  const now = Date.now();
  const weekEnd = now + 7 * 86400000;
  return events.filter((event) => {
    const t = new Date(event.startTime).getTime();
    return !Number.isNaN(t) && t >= now && t <= weekEnd;
  }).length;
}

export async function loadDashboardData(): Promise<DashboardData> {
  const [shops, events, communities, zones, mapItems, clubs, members] =
    await Promise.all([
      getApprovedShops(),
      getUpcomingEvents(),
      getApprovedCommunities(),
      getApprovedCommunityZones(),
      loadMapItems(),
      getApprovedClubs(),
      getApprovedClubMembers(),
    ]);

  const selectedPlaceId = "kmc-performance";
  const upcoming = events.filter((e) => {
    const t = new Date(e.startTime).getTime();
    return !Number.isNaN(t) && t >= Date.now();
  });

  return {
    shops: shops.map(shopToShopItem),
    events: events.map(eventToEventItem),
    communities: communities.map(communityToCommunityItem),
    clubAreas: zones.map(zoneToClubArea),
    places: shopsToPlaces(shops),
    mapPins: buildMapPins(shops, events, communities),
    mapItems,
    selectedPlaceId,
    stats: {
      eventsThisWeek: countEventsThisWeek(events),
      clubsMapped: clubs.length,
      shopsListed: shops.length,
      memberGarages: members.length,
    },
    featuredEvent: upcoming[0] ?? null,
    rawEvents: events,
    rawShops: shops,
    rawClubs: clubs,
  };
}
