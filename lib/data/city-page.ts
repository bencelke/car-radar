import { getApprovedCommunityZones } from "@/lib/repositories/community-zones";
import { getApprovedClubMembers } from "@/lib/repositories/club-members";
import { getApprovedClubs } from "@/lib/repositories/clubs";
import { getApprovedEvents } from "@/lib/repositories/events";
import { getApprovedShops } from "@/lib/repositories/shops";
import type {
  CarEvent,
  CarShop,
  Club,
  ClubMember,
  CommunityZone,
} from "@/lib/types";
import { formatCityFromSlug, matchesCitySlug } from "@/lib/utils/slug";

export type CityPageData = {
  citySlug: string;
  cityName: string;
  shops: CarShop[];
  events: CarEvent[];
  clubs: Club[];
  members: ClubMember[];
  zones: CommunityZone[];
};

function resolveCityName(
  citySlug: string,
  samples: { city: string }[]
): string {
  const match = samples.find((s) => matchesCitySlug(s.city, citySlug));
  return match?.city ?? formatCityFromSlug(citySlug);
}

export async function loadCityPageData(citySlug: string): Promise<CityPageData> {
  const normalized = citySlug.toLowerCase().trim();
  const [shops, events, clubs, members, zones] = await Promise.all([
    getApprovedShops(),
    getApprovedEvents(),
    getApprovedClubs(),
    getApprovedClubMembers(),
    getApprovedCommunityZones(),
  ]);

  const filteredShops = shops.filter((s) => matchesCitySlug(s.city, normalized));
  const filteredEvents = events.filter((e) => matchesCitySlug(e.city, normalized));
  const filteredClubs = clubs.filter((c) => matchesCitySlug(c.city, normalized));
  const filteredMembers = members.filter((m) =>
    matchesCitySlug(m.city, normalized)
  );
  const filteredZones = zones.filter((z) => matchesCitySlug(z.city, normalized));

  const samples = [
    ...filteredShops,
    ...filteredEvents,
    ...filteredClubs,
    ...filteredMembers,
    ...filteredZones,
  ];

  const cityName = resolveCityName(normalized, samples);
  const hasContent =
    filteredShops.length > 0 ||
    filteredEvents.length > 0 ||
    filteredClubs.length > 0 ||
    filteredMembers.length > 0 ||
    filteredZones.length > 0;

  if (!hasContent) {
    return {
      citySlug: normalized,
      cityName,
      shops: [],
      events: [],
      clubs: [],
      members: [],
      zones: [],
    };
  }

  return {
    citySlug: normalized,
    cityName,
    shops: filteredShops,
    events: filteredEvents,
    clubs: filteredClubs,
    members: filteredMembers,
    zones: filteredZones,
  };
}

export function cityPageHasContent(data: CityPageData): boolean {
  return (
    data.shops.length > 0 ||
    data.events.length > 0 ||
    data.clubs.length > 0 ||
    data.members.length > 0 ||
    data.zones.length > 0
  );
}
