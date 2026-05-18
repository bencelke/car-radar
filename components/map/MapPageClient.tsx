"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CarRadarMap, type MapLoadStatus } from "@/components/map/CarRadarMap";
import { MapDetailPanel } from "@/components/map/MapDetailPanel";
import { MapFallback } from "@/components/map/MapFallback";
import { MapFilterBar } from "@/components/map/MapFilterBar";
import { MapLegend } from "@/components/map/MapLegend";
import { MapSortControl } from "@/components/map/MapSortControl";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
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

  useEffect(() => {
    if (selectedId && !visible.some((i) => i.id === selectedId)) {
      setSelectedId(null);
    }
  }, [visible, selectedId]);

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
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

      <MapFilterBar
        active={filter}
        counts={counts}
        onChange={setFilter}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
      />

      <p className="text-xs text-white/40">{visibleLabel}</p>

      <div className="flex flex-col gap-4 lg:flex-row">
        <GlassPanel className="relative min-h-[640px] h-[72vh] flex-1 overflow-hidden">
          {hasToken && mapboxToken && mapStatus !== "error" ? (
            <CarRadarMap
              variant="full"
              accessToken={mapboxToken}
              items={visible}
              selectedId={selectedId}
              onSelectItem={(item) => setSelectedId(item.id)}
              onStatusChange={handleMapStatus}
              showNativeControls
              showCustomControls={false}
              enhanceMarkers
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

          <div className="pointer-events-none absolute bottom-3 left-3 z-10">
            <MapLegend />
          </div>
        </GlassPanel>

        <MapDetailPanel
          item={selectedItem}
          className="hidden lg:flex lg:sticky lg:top-24 lg:self-start"
        />
      </div>

      {selectedItem ? (
        <MapDetailPanel item={selectedItem} className="lg:hidden" />
      ) : null}
    </div>
  );
}
