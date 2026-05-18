"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { MAP_CATEGORY_FILTER_OPTIONS } from "@/lib/map/map-filters";
import type { MapCategoryFilterId, MapFilterId } from "@/lib/types";
import { cn } from "@/lib/utils";

type FilterOption = {
  id: MapFilterId;
  labelKey: keyof typeof import("@/lib/i18n/en").en.map;
};

const TYPE_FILTERS: FilterOption[] = [
  { id: "all", labelKey: "filterAll" },
  { id: "member", labelKey: "filterMembers" },
  { id: "shop", labelKey: "filterShops" },
  { id: "event", labelKey: "filterEvents" },
  { id: "club", labelKey: "filterClubs" },
  { id: "zone", labelKey: "filterZones" },
];

type MapFilterBarProps = {
  active: MapFilterId;
  counts: Record<MapFilterId, number>;
  onChange: (filter: MapFilterId) => void;
  categoryFilter?: MapCategoryFilterId;
  onCategoryChange?: (filter: MapCategoryFilterId) => void;
  showCategoryFilters?: boolean;
};

export function MapFilterBar({
  active,
  counts,
  onChange,
  categoryFilter = "all",
  onCategoryChange,
  showCategoryFilters = true,
}: MapFilterBarProps) {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => {
          const label = t.map[filter.labelKey];
          const count = counts[filter.id];
          const selected = active === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onChange(filter.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                selected
                  ? "border-blue-500/50 bg-blue-500/15 text-blue-100 shadow-[0_0_16px_rgba(59,130,246,0.25)]"
                  : "border-white/10 bg-[#0B1118]/80 text-white/65 hover:border-white/20 hover:text-white"
              )}
            >
              {label}
              <span className="ml-1.5 text-white/40">({count})</span>
            </button>
          );
        })}
      </div>
      {showCategoryFilters && onCategoryChange ? (
        <div className="flex flex-wrap gap-1.5">
          {MAP_CATEGORY_FILTER_OPTIONS.map((cat) => {
            const selected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                  selected
                    ? "border-orange-500/40 bg-orange-500/10 text-orange-100"
                    : "border-white/[0.06] bg-white/[0.03] text-white/45 hover:text-white/70"
                )}
              >
                {t.map[cat.labelKey]}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
