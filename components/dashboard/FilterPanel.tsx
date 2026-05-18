"use client";

import { MapPin, Search } from "lucide-react";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { MapSortControl } from "@/components/map/MapSortControl";
import { useLocale } from "@/components/providers/LocaleProvider";
import { brand } from "@/lib/config/brand";
import {
  MAP_CATEGORY_FILTER_OPTIONS,
  MAP_TYPE_FILTER_OPTIONS,
} from "@/lib/map/map-filters";
import type { MapCategoryFilterId, MapFilterId, MapSortId } from "@/lib/types";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  typeFilter: MapFilterId;
  onTypeFilterChange: (id: MapFilterId) => void;
  categoryFilter: MapCategoryFilterId;
  onCategoryFilterChange: (id: MapCategoryFilterId) => void;
  sortMode: MapSortId;
  onSortChange: (sort: MapSortId) => void;
};

export function FilterPanel({
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortMode,
  onSortChange,
}: FilterPanelProps) {
  const { t } = useLocale();

  return (
    <div className="flex flex-col gap-3">
      <GlassPanel className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
          <input
            type="search"
            placeholder={t.map.searchPlaceholder}
            className="h-9 w-full rounded-xl border border-white/[0.08] bg-[#151B24]/80 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/30"
          />
        </div>
        <div className="mt-2">
          <MapSortControl value={sortMode} onChange={onSortChange} className="w-full" />
        </div>
      </GlassPanel>

      <GlassPanel className="p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
          {t.map.filterTypeLabel}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MAP_TYPE_FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onTypeFilterChange(filter.typeFilter)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                typeFilter === filter.typeFilter
                  ? "border-[#EF4444]/50 bg-[#EF4444]/15 text-[#F8FAFC] shadow-[0_0_12px_-4px_rgba(239,68,68,0.4)]"
                  : "border-white/[0.06] bg-[#151B24]/60 text-[#64748B] hover:border-white/[0.1] hover:text-[#CBD5E1]"
              )}
            >
              {t.map[filter.labelKey]}
            </button>
          ))}
        </div>
        <p className="mb-2 mt-3 text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
          {t.map.filterCategoryLabel}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MAP_CATEGORY_FILTER_OPTIONS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryFilterChange(cat.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-medium transition",
                categoryFilter === cat.id
                  ? "border-orange-500/40 bg-orange-500/10 text-orange-100"
                  : "border-white/[0.06] bg-[#151B24]/60 text-[#64748B] hover:text-[#CBD5E1]"
              )}
            >
              {t.map[cat.labelKey]}
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10">
            <MapPin className="size-4 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
              {brand.location.label}
            </p>
            <p className="mt-1 font-heading text-sm font-semibold text-[#F8FAFC]">
              {brand.location.city}, {brand.location.country}
            </p>
            <p className="text-xs text-[#64748B]">
              within {brand.location.radiusKm} km
            </p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
