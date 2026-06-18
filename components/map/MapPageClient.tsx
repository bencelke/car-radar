"use client";

import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CarRadarMap, type MapLoadStatus } from "@/components/map/CarRadarMap";
import { MapDetailPanel } from "@/components/map/MapDetailPanel";
import { MapFallback } from "@/components/map/MapFallback";
import { MapFilterBar } from "@/components/map/MapFilterBar";
import { MapLegend } from "@/components/map/MapLegend";
import { MapSortControl } from "@/components/map/MapSortControl";
import { MobileDetailSheet } from "@/components/mobile/MobileDetailSheet";
import { MobileFilterSheet } from "@/components/mobile/MobileFilterSheet";
import { MobileMapToolbar } from "@/components/mobile/MobileMapToolbar";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { countActiveMapFilters } from "@/lib/map/active-filter-count";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import {
  getMapboxToken,
  logMapboxTokenDiagnostic,
  type MapErrorCategory,
} from "@/lib/map/map-config";
import {
  countMapItemsByType,
  filterMapItems,
  searchMapItems,
  sortMapItems,
} from "@/lib/map/map-utils";
import type { MapCategoryFilterId, MapFilterId, MapItem, MapSortId } from "@/lib/types";

type MapPageClientProps = {
  items: MapItem[];
};

export function MapPageClient({ items }: MapPageClientProps) {
  const { t } = useLocale();
  const [filter, setFilter] = useState<MapFilterId>("all");
  const [categoryFilter, setCategoryFilter] = useState<MapCategoryFilterId>("all");
  const [sortMode, setSortMode] = useState<MapSortId>("featured");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapStatus, setMapStatus] = useState<MapLoadStatus>("loading");
  const [mapErrorCategory, setMapErrorCategory] =
    useState<MapErrorCategory>("unknown");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [closedDetailId, setClosedDetailId] = useState<string | null>(null);
  const [layoutRevision, setLayoutRevision] = useState(0);
  const isMobileLayout = useMediaQuery("(max-width: 1023px)");

  const bumpLayout = useCallback(() => {
    setLayoutRevision((value) => value + 1);
  }, []);

  const mapboxToken = useMemo(() => getMapboxToken(), []);
  const hasToken = Boolean(mapboxToken);

  useEffect(() => {
    logMapboxTokenDiagnostic();
  }, []);

  const searched = useMemo(
    () => searchMapItems(items, search),
    [items, search]
  );

  const counts = useMemo(() => countMapItemsByType(searched), [searched]);

  const visible = useMemo(() => {
    const filtered = filterMapItems(searched, {
      typeFilter: filter,
      categoryFilter,
    });
    return sortMapItems(filtered, sortMode);
  }, [searched, filter, categoryFilter, sortMode]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return visible.find((i) => i.id === selectedId) ?? null;
  }, [visible, selectedId]);

  const activeFilterCount = useMemo(
    () => countActiveMapFilters(filter, categoryFilter, search),
    [filter, categoryFilter, search]
  );

  useEffect(() => {
    if (selectedId && !visible.some((i) => i.id === selectedId)) {
      setSelectedId(null);
      setClosedDetailId(null);
    }
  }, [visible, selectedId]);

  const detailSheetOpen =
    isMobileLayout &&
    Boolean(selectedItem) &&
    selectedItem?.id !== closedDetailId;

  const visibleLabel = t.map.visibleCount.replace(
    "{count}",
    String(visible.length)
  );

  const fallbackVariant: MapErrorCategory = hasToken
    ? mapErrorCategory
    : "missing-token";

  const handleMapStatus = (status: MapLoadStatus, category?: MapErrorCategory) => {
    setMapStatus(status);
    if (category) setMapErrorCategory(category);
  };

  const handleSelectItem = useCallback((item: MapItem) => {
    setSelectedId(item.id);
    setClosedDetailId(null);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilter("all");
    setCategoryFilter("all");
    setSearch("");
  }, []);

  const handleApplyFilters = useCallback(() => {
    setFilterSheetOpen(false);
    bumpLayout();
  }, [bumpLayout]);

  const handleFilterSheetChange = useCallback(
    (open: boolean) => {
      setFilterSheetOpen(open);
      if (!open) bumpLayout();
    },
    [bumpLayout]
  );

  return (
    <div className="flex flex-col md:gap-4">
      <div className="hidden flex-col gap-3 md:flex lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-white md:text-3xl">
            {t.map.title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-white/55">
            {t.map.subtitle}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:max-w-md lg:flex-col lg:items-stretch">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.map.searchPlaceholder}
              className="w-full rounded-xl border border-white/10 bg-[#0B1118]/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <MapSortControl value={sortMode} onChange={setSortMode} className="w-full sm:w-auto" />
        </div>
      </div>

      <div className="hidden md:block">
        <MapFilterBar
          active={filter}
          counts={counts}
          onChange={setFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
        <p className="mt-2 text-xs text-white/40">{visibleLabel}</p>
      </div>

      <div className="relative flex flex-col md:gap-4 lg:flex-row">
        <GlassPanel className="relative mobile-map-viewport flex-1 overflow-hidden md:min-h-[640px] md:h-[72vh]">
          {hasToken && mapboxToken && mapStatus !== "error" ? (
            <CarRadarMap
              variant="full"
              accessToken={mapboxToken}
              items={visible}
              selectedId={selectedId}
              onSelectItem={handleSelectItem}
              onStatusChange={handleMapStatus}
              showNativeControls
              showCustomControls={false}
              enhanceMarkers
              layoutRevision={layoutRevision}
            />
          ) : null}

          {!hasToken || mapStatus === "error" ? (
            <MapFallback variant={fallbackVariant} embedded />
          ) : null}

          {hasToken && mapStatus === "loading" ? (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#05070a]/40">
              <p className="text-xs text-white/50">{t.map.mapLoading}</p>
            </div>
          ) : null}

          <MobileMapToolbar
            search={search}
            onSearchChange={setSearch}
            onOpenFilters={() => setFilterSheetOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          <div className="pointer-events-none absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-10 md:bottom-3">
            <MapLegend />
          </div>
        </GlassPanel>

        <MapDetailPanel
          item={selectedItem}
          className="hidden lg:flex lg:sticky lg:top-24 lg:w-80 lg:shrink-0 lg:self-start"
        />
      </div>

      <MobileFilterSheet
        open={filterSheetOpen}
        onOpenChange={handleFilterSheetChange}
        typeFilter={filter}
        onTypeFilterChange={setFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        sortMode={sortMode}
        onSortChange={setSortMode}
        counts={counts}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
      />

      {isMobileLayout ? (
        <MobileDetailSheet
          item={selectedItem}
          open={detailSheetOpen}
          onOpenChange={(open) => {
            if (!open) {
              setClosedDetailId(selectedItem?.id ?? null);
              bumpLayout();
            }
          }}
        />
      ) : null}
    </div>
  );
}
