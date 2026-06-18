import type { MapCategoryFilterId, MapFilterId } from "@/lib/types";

export type MapFilterOption = {
  id: string;
  labelKey: keyof typeof import("@/lib/i18n/en").en.map;
  typeFilter: MapFilterId;
  categoryFilter?: MapCategoryFilterId;
};

export const MAP_TYPE_FILTER_OPTIONS: MapFilterOption[] = [
  { id: "all", labelKey: "filterAll", typeFilter: "all" },
  { id: "shop", labelKey: "filterShops", typeFilter: "shop" },
  { id: "event", labelKey: "filterEvents", typeFilter: "event" },
  { id: "club", labelKey: "filterClubs", typeFilter: "club" },
  { id: "zone", labelKey: "filterZones", typeFilter: "zone" },
];

export const MAP_CATEGORY_FILTER_OPTIONS: {
  id: MapCategoryFilterId;
  labelKey: keyof typeof import("@/lib/i18n/en").en.map;
}[] = [
  { id: "all", labelKey: "filterCategoryAll" },
  { id: "tuning", labelKey: "filterCategoryTuning" },
  { id: "wheels", labelKey: "filterCategoryWheels" },
  { id: "detailing", labelKey: "filterCategoryDetailing" },
  { id: "wrap", labelKey: "filterCategoryWrap" },
];

/** Map legacy dashboard filter ids to unified type/category filters. */
export function dashboardFilterToMapFilters(filterId: string): {
  typeFilter: MapFilterId;
  categoryFilter: MapCategoryFilterId;
} {
  switch (filterId) {
    case "members":
    case "member":
      return { typeFilter: "all", categoryFilter: "all" };
    case "shops":
    case "shop":
      return { typeFilter: "shop", categoryFilter: "all" };
    case "events":
    case "event":
      return { typeFilter: "event", categoryFilter: "all" };
    case "clubs":
      return { typeFilter: "club", categoryFilter: "all" };
    case "club-areas":
    case "zones":
      return { typeFilter: "zone", categoryFilter: "all" };
    case "tuning":
      return { typeFilter: "shop", categoryFilter: "tuning" };
    case "wheels":
      return { typeFilter: "shop", categoryFilter: "wheels" };
    case "detailing":
      return { typeFilter: "shop", categoryFilter: "detailing" };
    case "wrap":
      return { typeFilter: "shop", categoryFilter: "wrap" };
    default:
      return { typeFilter: "all", categoryFilter: "all" };
  }
}
