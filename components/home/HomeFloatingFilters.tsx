"use client";

import { Search } from "lucide-react";

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

type HomeFloatingFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: MapFilterId;
  onTypeFilterChange: (id: MapFilterId) => void;
  categoryFilter: MapCategoryFilterId;
  onCategoryFilterChange: (id: MapCategoryFilterId) => void;
  sortMode: MapSortId;
  onSortChange: (sort: MapSortId) => void;
  visibleCount: number;
};

export function HomeFloatingFilters({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortMode,
  onSortChange,
  visibleCount,
}: HomeFloatingFiltersProps) {
  const { t } = useLocale();

  return (
    <GlassPanel
      elevated
      className="max-h-[min(480px,calc(100vh-12rem))] overflow-y-auto border-white/10 bg-[#05070a]/75 shadow-[0_12px_48px_rgba(0,0,0,0.55)]"
    >
      <div className="border-b border-white/[0.06] p-3">
        <p className="font-heading text-xs font-semibold uppercase tracking-[0.2em] text-[#EF4444]/90">
          {brand.appName}
        </p>
        <p className="mt-1 font-heading text-lg font-bold leading-tight text-[#F8FAFC]">
          {t.home.heroTagline}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#94A3B8]">
          {t.home.heroSubtitle}
        </p>
      </div>

      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.map.searchPlaceholder}
            className="h-9 w-full rounded-xl border border-white/[0.08] bg-[#151B24]/90 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/30"
          />
        </div>
        <div className="mt-2">
          <MapSortControl value={sortMode} onChange={onSortChange} className="w-full" />
        </div>
        <p className="mt-2 text-[10px] text-white/40">
          {t.map.visibleCount.replace("{count}", String(visibleCount))}
        </p>
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
          {t.map.filterTypeLabel}
        </p>
        <div className="flex flex-wrap gap-1">
          {MAP_TYPE_FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onTypeFilterChange(filter.typeFilter)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium transition",
                typeFilter === filter.typeFilter
                  ? "border-[#EF4444]/50 bg-[#EF4444]/15 text-[#F8FAFC]"
                  : "border-white/[0.06] bg-[#151B24]/60 text-[#64748B] hover:text-[#CBD5E1]"
              )}
            >
              {t.map[filter.labelKey]}
            </button>
          ))}
        </div>
        <p className="mb-2 mt-3 text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
          {t.map.filterCategoryLabel}
        </p>
        <div className="flex flex-wrap gap-1">
          {MAP_CATEGORY_FILTER_OPTIONS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryFilterChange(cat.id)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium transition",
                categoryFilter === cat.id
                  ? "border-[#3B82F6]/50 bg-[#3B82F6]/15 text-[#F8FAFC]"
                  : "border-white/[0.06] bg-[#151B24]/60 text-[#64748B] hover:text-[#CBD5E1]"
              )}
            >
              {t.map[cat.labelKey]}
            </button>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
