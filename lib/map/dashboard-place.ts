import type { AccentColor, MapItem, Place } from "@/lib/types";

const accentByMapType: Record<MapItem["type"], AccentColor> = {
  shop: "orange",
  event: "purple",
  club: "blue",
  member: "green",
  zone: "gold",
};

const gradientByAccent: Record<AccentColor, string> = {
  red: "from-red-600/50 to-rose-900/30",
  orange: "from-orange-600/50 to-amber-900/30",
  purple: "from-purple-600/50 to-indigo-900/30",
  blue: "from-blue-600/60 to-indigo-900/40",
  green: "from-green-600/60 to-emerald-900/40",
  gold: "from-amber-500/60 to-orange-900/40",
};

function entityIdFromMapItem(item: MapItem): string {
  const prefix = `${item.type}-`;
  return item.id.startsWith(prefix) ? item.id.slice(prefix.length) : item.id;
}

/** Resolve homepage detail panel content from a map marker selection. */
export function resolvePlaceForMapItem(item: MapItem, places: Place[]): Place {
  if (item.type === "shop") {
    const shopId = entityIdFromMapItem(item);
    const match = places.find((p) => p.id === shopId);
    if (match) return match;
  }

  const accent = accentByMapType[item.type];
  const rating =
    typeof item.metadata?.rating === "number" ? item.metadata.rating : 4.5;

  return {
    id: entityIdFromMapItem(item),
    name: item.title,
    category: item.category,
    city: item.city,
    country: item.country,
    rating,
    status: "open",
    verified: Boolean(item.verified),
    description: item.description || `${item.title} — ${item.city}`,
    services: [],
    gradient: gradientByAccent[accent],
    accent,
  };
}
