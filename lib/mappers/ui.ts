import type { AccentColor } from "@/lib/types/ui";
import type {
  CarEvent,
  CarShop,
  Community,
  CommunityZone,
  PlaceCategory,
  Submission,
} from "@/lib/types/domain";
import type {
  AdminSubmission,
  ClubArea,
  CommunityItem,
  EventItem,
  MapPin,
  Place,
  ShopItem,
} from "@/lib/types/ui";

const categoryAccent: Partial<Record<PlaceCategory, AccentColor>> = {
  turbo: "red",
  tuning: "red",
  wheels: "gold",
  detailing: "green",
  wrap_tint: "purple",
  club: "blue",
  event: "orange",
  vendor: "orange",
  other: "blue",
};

const categoryLabels: Record<PlaceCategory, string> = {
  tuning: "Tuning",
  turbo: "Turbo / Tuning",
  wheels: "Wheels / Rims",
  detailing: "Detailing",
  wrap_tint: "Wrap / Tint",
  club: "Club",
  event: "Event",
  vendor: "Vendor",
  dealership: "Dealership",
  audio: "Audio",
  tires: "Tires",
  other: "Other",
};

export function categoryToLabel(category: PlaceCategory): string {
  return categoryLabels[category] ?? category;
}

export function categoryToAccent(category: PlaceCategory): AccentColor {
  return categoryAccent[category] ?? "blue";
}

function gradientForAccent(accent: AccentColor): string {
  const map: Record<AccentColor, string> = {
    red: "from-red-600/50 to-rose-900/30",
    orange: "from-orange-600/50 to-amber-900/30",
    purple: "from-purple-600/50 to-indigo-900/30",
    blue: "from-blue-600/60 to-indigo-900/40",
    green: "from-green-600/60 to-emerald-900/40",
    gold: "from-amber-500/60 to-orange-900/40",
  };
  return map[accent];
}

function formatEventDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { date: iso, time: "" };
  }
  return {
    date: d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
}

export function formatMemberCount(count?: number): string {
  if (count == null) return "—";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

const mapPinPositions: Record<string, { top: string; left: string }> = {
  "cars-coffee-kl": { top: "22%", left: "28%" },
  "kmc-performance": { top: "38%", left: "52%" },
  "royal-wraps": { top: "55%", left: "35%" },
  "bavarian-crew": { top: "48%", left: "68%" },
  "jdm-kl": { top: "62%", left: "58%" },
  "wheel-empire": { top: "30%", left: "72%" },
  "turbo-zone": { top: "42%", left: "40%" },
  "detailing-kings": { top: "68%", left: "25%" },
};

export function shopToShopItem(shop: CarShop): ShopItem {
  const accent = categoryToAccent(shop.category);
  return {
    id: shop.id,
    name: shop.name,
    category: categoryToLabel(shop.category),
    city: shop.city,
    rating: shop.rating ?? 0,
    gradient: gradientForAccent(accent),
    accent,
  };
}

export function eventToEventItem(event: CarEvent): EventItem {
  const accent: AccentColor =
    event.type.toLowerCase().includes("cruise") ? "purple" : "orange";
  const { date, time } = formatEventDate(event.startTime);
  return {
    id: event.id,
    title: event.title,
    date,
    time,
    city: event.city,
    interested: event.interestedCount ?? 0,
    gradient: gradientForAccent(accent),
    accent,
  };
}

export function communityToCommunityItem(community: Community): CommunityItem {
  const accent: AccentColor = community.type.toLowerCase().includes("jdm")
    ? "red"
    : "blue";
  return {
    id: community.id,
    name: community.name,
    members: formatMemberCount(community.memberCount),
    city: community.city,
    description: community.description,
    gradient: gradientForAccent(accent),
    accent,
  };
}

function placeGradient(accent: AccentColor): string {
  const map: Record<AccentColor, string> = {
    red: "from-red-600/40 via-orange-500/20 to-[#0B1118]",
    orange: "from-orange-600/40 via-amber-500/20 to-[#0B1118]",
    purple: "from-purple-600/40 via-violet-500/20 to-[#0B1118]",
    blue: "from-blue-600/40 via-cyan-500/20 to-[#0B1118]",
    green: "from-green-600/40 via-emerald-500/20 to-[#0B1118]",
    gold: "from-amber-500/40 via-orange-500/20 to-[#0B1118]",
  };
  return map[accent];
}

export function shopToPlace(shop: CarShop): Place {
  const accent = categoryToAccent(shop.category);
  return {
    id: shop.id,
    name: shop.name,
    category: categoryToLabel(shop.category),
    city: shop.city,
    country: shop.country,
    rating: shop.rating ?? 0,
    status: "open",
    verified: shop.verified,
    description: shop.description,
    services: shop.services,
    gradient: placeGradient(accent),
    accent,
  };
}

export function shopToMapPin(shop: CarShop): MapPin {
  const position = mapPinPositions[shop.id] ?? { top: "50%", left: "50%" };
  return {
    id: shop.id,
    name: shop.name,
    category: categoryToLabel(shop.category),
    position,
    accent: categoryToAccent(shop.category),
  };
}

export function eventToMapPin(event: CarEvent): MapPin {
  const position = mapPinPositions[event.id] ?? { top: "35%", left: "45%" };
  return {
    id: event.id,
    name: event.title,
    category: event.type,
    position,
    accent: "orange",
  };
}

export function zoneToClubArea(zone: CommunityZone): ClubArea {
  const positions: Record<
    string,
    Pick<ClubArea, "position" | "width" | "height" | "accent">
  > = {
    "bavarian-zone": {
      position: { top: "20%", left: "15%" },
      width: "38%",
      height: "35%",
      accent: "blue",
    },
    "jdm-zone": {
      position: { top: "45%", left: "48%" },
      width: "32%",
      height: "28%",
      accent: "red",
    },
    "muscle-area": {
      position: { top: "25%", left: "58%" },
      width: "30%",
      height: "32%",
      accent: "orange",
    },
  };
  const preset = positions[zone.id];
  return {
    id: zone.id,
    name: zone.name,
    position: preset?.position ?? { top: "40%", left: "40%" },
    width: preset?.width ?? "30%",
    height: preset?.height ?? "25%",
    accent: preset?.accent ?? "blue",
  };
}

export function submissionToAdminSubmission(sub: Submission): AdminSubmission {
  const typeLabel =
    sub.type === "shop"
      ? "Shop"
      : sub.type === "event"
        ? "Event"
        : sub.type === "member"
          ? "Member"
          : sub.type === "club"
            ? "Club"
            : sub.type === "community"
              ? "Community"
              : "Correction";
  return {
    id: sub.id,
    type: typeLabel,
    name: sub.name,
    status:
      sub.status === "pending"
        ? "Pending"
        : sub.status === "approved"
          ? "Approved"
          : sub.status === "needs_changes"
            ? "Needs Changes"
            : "Rejected",
  };
}

export function buildMapPins(
  shops: CarShop[],
  events: CarEvent[],
  communities: Community[]
): MapPin[] {
  return [
    ...shops.slice(0, 4).map(shopToMapPin),
    ...events.slice(0, 2).map(eventToMapPin),
    ...communities.slice(0, 2).map((c) => ({
      id: c.id,
      name: c.name,
      category: c.type,
      position: mapPinPositions[c.id] ?? { top: "50%", left: "60%" },
      accent: "blue" as AccentColor,
    })),
  ];
}

export function shopsToPlaces(shops: CarShop[]): Place[] {
  return shops.map(shopToPlace);
}
