import type { MapFilterId, MapItem, MapItemType } from "@/lib/types";

/** Approximate city centers for mock geolocation (no external geocoding). */
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  kaiserslautern: { lat: 49.4401, lng: 7.7491 },
  ramstein: { lat: 49.4369, lng: 7.6003 },
  frankfurt: { lat: 50.1109, lng: 8.6821 },
  stuttgart: { lat: 48.7758, lng: 9.1829 },
  mannheim: { lat: 49.4875, lng: 8.466 },
  nurburg: { lat: 50.3356, lng: 6.9475 },
  nürburg: { lat: 50.3356, lng: 6.9475 },
  nurburgring: { lat: 50.3356, lng: 6.9475 },
};

export function resolveCityCoordinates(
  city: string,
  area?: string
): { lat: number; lng: number } {
  const key = (area || city).toLowerCase().replace(/\s+/g, "");
  for (const [name, coords] of Object.entries(CITY_COORDINATES)) {
    if (key.includes(name.replace(/\s+/g, ""))) return { ...coords };
  }
  return { ...CITY_COORDINATES.kaiserslautern };
}

/** Spread markers near a base point so members do not stack. */
export function offsetCoordinates(
  id: string,
  baseLat: number,
  baseLng: number,
  index = 0
): { lat: number; lng: number } {
  let hash = index;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % 9973;
  }
  const angle = (hash / 9973) * Math.PI * 2;
  const dist = 0.006 + (hash % 120) / 8000;
  return {
    lat: baseLat + Math.sin(angle) * dist,
    lng: baseLng + Math.cos(angle) * dist,
  };
}

export function mapItemMatchesFilter(
  item: MapItem,
  filter: MapFilterId
): boolean {
  if (filter === "all") return true;
  if (filter === "zone") return item.type === "zone";
  return item.type === filter;
}

export const MARKER_STYLES: Record<
  MapItemType,
  { letter: string; border: string; glow: string; bg: string }
> = {
  shop: {
    letter: "S",
    border: "#F97316",
    glow: "rgba(249,115,22,0.65)",
    bg: "#0B1118",
  },
  event: {
    letter: "E",
    border: "#A855F7",
    glow: "rgba(168,85,247,0.65)",
    bg: "#0B1118",
  },
  club: {
    letter: "C",
    border: "#3B82F6",
    glow: "rgba(59,130,246,0.65)",
    bg: "#0B1118",
  },
  member: {
    letter: "M",
    border: "#22C55E",
    glow: "rgba(34,197,94,0.65)",
    bg: "#0B1118",
  },
  zone: {
    letter: "Z",
    border: "#FACC15",
    glow: "rgba(250,204,21,0.5)",
    bg: "#111827",
  },
};

/** Homepage filter panel ids → visible map markers */
export function filterMapItemsForDashboard(
  items: MapItem[],
  filterId: string
): MapItem[] {
  switch (filterId) {
    case "events":
      return items.filter((i) => i.type === "event");
    case "shops":
      return items.filter((i) => i.type === "shop");
    case "tuning":
      return items.filter(
        (i) =>
          i.type === "shop" && /turbo|tuning/i.test(`${i.category} ${i.title}`)
      );
    case "wheels":
      return items.filter(
        (i) =>
          i.type === "shop" && /wheel|rim/i.test(`${i.category} ${i.title}`)
      );
    case "detailing":
      return items.filter(
        (i) => i.type === "shop" && /detail/i.test(`${i.category} ${i.title}`)
      );
    case "wrap":
      return items.filter(
        (i) =>
          i.type === "shop" && /wrap|tint/i.test(`${i.category} ${i.title}`)
      );
    case "clubs":
      return items.filter((i) => i.type === "zone" || i.type === "club");
    case "all":
    default:
      return items;
  }
}

export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function searchMapItems(items: MapItem[], query: string): MapItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const haystack = [
      item.title,
      item.category,
      item.city,
      item.country,
      item.description,
      item.type,
      ...(item.metadata
        ? Object.values(item.metadata).map(String)
        : []),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
