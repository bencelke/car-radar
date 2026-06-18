import { dashboardFilterToMapFilters } from "@/lib/map/map-filters";
import { DEFAULT_CENTER } from "@/lib/map/map-config";
import type {
  MapCategoryFilterId,
  MapFilterId,
  MapItem,
  MapItemType,
  MapSortId,
} from "@/lib/types";

/** Approximate city centers for mock geolocation (no external geocoding). */
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  kaiserslautern: { lat: 49.4401, lng: 7.7491 },
  ramstein: { lat: 49.4369, lng: 7.6003 },
  landstuhl: { lat: 49.428, lng: 7.568 },
  frankfurt: { lat: 50.1109, lng: 8.6821 },
  stuttgart: { lat: 48.7758, lng: 9.1829 },
  mannheim: { lat: 49.4875, lng: 8.466 },
  nurburg: { lat: 50.3356, lng: 6.9475 },
  nürburg: { lat: 50.3356, lng: 6.9475 },
  nurburgring: { lat: 50.3356, lng: 6.9475 },
};

const TYPE_ORDER: Record<MapItemType, number> = {
  member: 0,
  shop: 1,
  event: 2,
  club: 3,
  zone: 4,
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
  const dist = 0.008 + (hash % 140) / 7500;
  return {
    lat: baseLat + Math.sin(angle) * dist,
    lng: baseLng + Math.cos(angle) * dist,
  };
}

export function mapItemMatchesFilter(
  item: MapItem,
  filter: MapFilterId
): boolean {
  if (filter === "member") return false;
  if (filter === "all") return item.type !== "member";
  if (filter === "zone") return item.type === "zone";
  return item.type === filter;
}

export function mapItemMatchesCategoryFilter(
  item: MapItem,
  categoryFilter: MapCategoryFilterId
): boolean {
  if (categoryFilter === "all") return true;
  if (item.type !== "shop") return false;
  const haystack = `${item.category} ${item.title} ${item.description}`.toLowerCase();
  switch (categoryFilter) {
    case "tuning":
      return /turbo|tuning|b58|performance/.test(haystack);
    case "wheels":
      return /wheel|rim|tire|fitment/.test(haystack);
    case "detailing":
      return /detail|ceramic|ppf|paint/.test(haystack);
    case "wrap":
      return /wrap|tint|vinyl/.test(haystack);
    default:
      return true;
  }
}

export type MapItemsFilterOptions = {
  typeFilter?: MapFilterId;
  categoryFilter?: MapCategoryFilterId;
  search?: string;
};

export function filterMapItems(
  items: MapItem[],
  options: MapItemsFilterOptions
): MapItem[] {
  const { typeFilter = "all", categoryFilter = "all", search = "" } = options;
  let result = searchMapItems(items, search);
  result = result.filter(
    (item) =>
      mapItemMatchesFilter(item, typeFilter) &&
      mapItemMatchesCategoryFilter(item, categoryFilter)
  );
  return result;
}

/** Dashboard left-panel filter ids → filtered map items */
export function filterMapItemsForDashboard(
  items: MapItem[],
  filterId: string
): MapItem[] {
  const { typeFilter, categoryFilter } = dashboardFilterToMapFilters(filterId);
  return filterMapItems(items, { typeFilter, categoryFilter });
}

export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function sortMapItems(items: MapItem[], sortMode: MapSortId): MapItem[] {
  const sorted = [...items];
  const center = DEFAULT_CENTER;

  switch (sortMode) {
    case "featured":
      sorted.sort((a, b) => {
        const f = Number(b.featured) - Number(a.featured);
        if (f !== 0) return f;
        return a.title.localeCompare(b.title);
      });
      break;
    case "nearest":
      sorted.sort(
        (a, b) =>
          calculateDistanceKm(center.lat, center.lng, a.lat, a.lng) -
          calculateDistanceKm(center.lat, center.lng, b.lat, b.lng)
      );
      break;
    case "newest":
      sorted.sort((a, b) => {
        const ta = String(a.createdAt ?? a.metadata?.startTime ?? "");
        const tb = String(b.createdAt ?? b.metadata?.startTime ?? "");
        return tb.localeCompare(ta);
      });
      break;
    case "alphabetical":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "type":
      sorted.sort((a, b) => {
        const t = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
        if (t !== 0) return t;
        return a.title.localeCompare(b.title);
      });
      break;
  }

  return sorted;
}

export function countMapItemsByType(
  items: MapItem[]
): Record<MapFilterId, number> {
  const base: Record<MapFilterId, number> = {
    all: items.length,
    club: 0,
    member: 0,
    event: 0,
    shop: 0,
    zone: 0,
  };
  for (const item of items) {
    if (item.type === "club") base.club++;
    if (item.type === "member") base.member++;
    if (item.type === "event") base.event++;
    if (item.type === "shop") base.shop++;
    if (item.type === "zone") base.zone++;
  }
  return base;
}

export const MARKER_STYLES: Record<
  MapItemType,
  { border: string; glow: string; bg: string; iconColor: string }
> = {
  shop: {
    border: "#F97316",
    glow: "rgba(249,115,22,0.7)",
    bg: "#0B1118",
    iconColor: "#FB923C",
  },
  event: {
    border: "#A855F7",
    glow: "rgba(168,85,247,0.7)",
    bg: "#0B1118",
    iconColor: "#C084FC",
  },
  club: {
    border: "#3B82F6",
    glow: "rgba(59,130,246,0.7)",
    bg: "#0B1118",
    iconColor: "#60A5FA",
  },
  member: {
    border: "#38BDF8",
    glow: "rgba(56,189,248,0.75)",
    bg: "#0B1118",
    iconColor: "#7DD3FC",
  },
  zone: {
    border: "rgba(250,204,21,0.45)",
    glow: "rgba(250,204,21,0.28)",
    bg: "#111827",
    iconColor: "rgba(253,224,71,0.85)",
  },
};

export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function searchMapItems(items: MapItem[], query: string): MapItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const meta = item.metadata
      ? Object.values(item.metadata).map(String).join(" ")
      : "";
    const tags = item.tags?.join(" ") ?? "";
    const haystack = [
      item.title,
      item.category,
      item.city,
      item.country,
      item.area,
      item.description,
      item.type,
      meta,
      tags,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function metaString(item: MapItem, key: string): string | undefined {
  const v = item.metadata?.[key];
  return v != null ? String(v) : undefined;
}

export function metaNumber(item: MapItem, key: string): number | undefined {
  const v = item.metadata?.[key];
  return typeof v === "number" ? v : undefined;
}
