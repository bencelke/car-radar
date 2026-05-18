"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { MapFilterId } from "@/lib/types";
import { cn } from "@/lib/utils";

type FilterOption = {
  id: MapFilterId;
  labelKey: keyof typeof import("@/lib/i18n/en").en.map;
};

const FILTERS: FilterOption[] = [
  { id: "all", labelKey: "filterAll" },
  { id: "club", labelKey: "filterClubs" },
  { id: "member", labelKey: "filterMembers" },
  { id: "event", labelKey: "filterEvents" },
  { id: "shop", labelKey: "filterShops" },
  { id: "zone", labelKey: "filterZones" },
];

type MapFilterBarProps = {
  active: MapFilterId;
  counts: Record<MapFilterId, number>;
  onChange: (filter: MapFilterId) => void;
};

export function MapFilterBar({ active, counts, onChange }: MapFilterBarProps) {
  const { t } = useLocale();

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
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
  );
}
