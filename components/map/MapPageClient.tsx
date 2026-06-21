"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { List, Map as MapIcon, Plus, Search } from "lucide-react";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { CarRadarMap, type MapLoadStatus } from "@/components/map/CarRadarMap";
import { MapDetailPanel } from "@/components/map/MapDetailPanel";
import { MapFallback } from "@/components/map/MapFallback";
import { MapFilterBar } from "@/components/map/MapFilterBar";
import { MapLegend } from "@/components/map/MapLegend";
import { MapResultsList } from "@/components/map/MapResultsList";
import { MapSortControl } from "@/components/map/MapSortControl";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { MobileDetailSheet } from "@/components/mobile/MobileDetailSheet";
import { MobileFilterSheet } from "@/components/mobile/MobileFilterSheet";
import { MobileMapToolbar } from "@/components/mobile/MobileMapToolbar";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { submitRoute } from "@/lib/config/routes";
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
import { cn } from "@/lib/utils";

type MapPageClientProps = {
  items: MapItem[];
};

type MobileView = "map" | "list";

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
  const [mobileView, setMobileView] = useState<MobileView>("map");
  const [panelMode, setPanelMode] = useState<"detail" | "list">("list");
  const isMobileLayout = useMediaQuery("(max-width: 1023px)");

  const bumpLayout = useCallback(() => {
    setLayoutRevision((value) => value + 1);
  }, []);

  const mapboxToken = useMemo(() => getMapboxToken(), []);
  const hasToken = Boolean(mapboxToken);

  useEffect(() => {
    logMapboxTokenDiagnostic();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const layer = params.get("layer");
    if (layer === "events") setFilter("event");
    else if (layer === "shops") setFilter("shop");
    else if (layer === "clubs") setFilter("club");
    else if (layer === "zones") setFilter("zone");
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

  useEffect(() => {
    if (selectedItem) setPanelMode("detail");
  }, [selectedItem]);

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
    setPanelMode("detail");
    if (isMobileLayout) setMobileView("map");
  }, [isMobileLayout]);

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

  const submitButton = (
    <Button
      nativeButton={false}
      render={<Link href={submitRoute()} />}
      size="sm"
      className="min-h-11 border border-[#EF4444]/50 bg-[#EF4444]/20 px-4 text-[#F8FAFC] shadow-[0_0_20px_-6px_rgba(239,68,68,0.45)] hover:bg-[#EF4444]/30"
    >
      <Plus className="mr-1.5 size-4" />
      {t.map.submitPlace}
    </Button>
  );

  return (
    <div className="flex flex-col gap-4 md:gap-5 lg:gap-6">
      <div className="hidden md:block">
        <PublicPageHeader
          title={t.map.title}
          subtitle={t.map.subtitle}
          actions={
            <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t.map.searchPlaceholder}
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#151B24]/80 py-2 pl-10 pr-4 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6]/40 focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/30"
                />
              </div>
              {submitButton}
            </div>
          }
        />
      </div>

      <div className="px-4 md:hidden">
        <PublicPageHeader
          compact
          title={t.map.title}
          subtitle={t.map.subtitle}
          actions={submitButton}
        />
        <div className="mt-3 flex gap-1 rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-1">
          <button
            type="button"
            onClick={() => setMobileView("map")}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium",
              mobileView === "map"
                ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                : "text-[#64748B]"
            )}
          >
            <MapIcon className="size-4" />
            {t.mobile.map}
          </button>
          <button
            type="button"
            onClick={() => setMobileView("list")}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg text-xs font-medium",
              mobileView === "list"
                ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                : "text-[#64748B]"
            )}
          >
            <List className="size-4" />
            {t.mobile.list}
          </button>
        </div>
      </div>

      <div className="hidden overflow-x-auto px-0 md:block md:px-0">
        <MapFilterBar
          active={filter}
          counts={counts}
          onChange={setFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-[#64748B]">{visibleLabel}</p>
          <MapSortControl value={sortMode} onChange={setSortMode} />
        </div>
      </div>

      {mobileView === "list" && isMobileLayout ? (
        <div className="px-4 pb-6">
          <MapResultsList
            items={visible}
            selectedId={selectedId}
            onSelect={handleSelectItem}
            maxItems={50}
          />
        </div>
      ) : (
        <div className="relative flex flex-col lg:flex-row lg:gap-5">
          <GlassPanel
            className={cn(
              "relative flex-1 overflow-hidden",
              "mobile-map-viewport md:min-h-[620px] md:h-[calc(100vh-13rem)] lg:min-h-[640px]"
            )}
          >
            {hasToken && mapboxToken && mapStatus !== "error" ? (
              <CarRadarMap
                variant="full"
                accessToken={mapboxToken}
                items={visible}
                selectedId={selectedId}
                onSelectItem={handleSelectItem}
                onStatusChange={handleMapStatus}
                showNativeControls={false}
                showCustomControls
                enhanceMarkers
                layoutRevision={layoutRevision}
              />
            ) : null}

            {!hasToken || mapStatus === "error" ? (
              <MapFallback variant={fallbackVariant} embedded />
            ) : null}

            {hasToken && mapStatus === "loading" ? (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#05070a]/40">
                <p className="text-xs text-[#64748B]">{t.map.mapLoading}</p>
              </div>
            ) : null}

            <MobileMapToolbar
              search={search}
              onSearchChange={setSearch}
              onOpenFilters={() => setFilterSheetOpen(true)}
              activeFilterCount={activeFilterCount}
            />

            <div className="pointer-events-none absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-10 md:bottom-4">
              <MapLegend />
            </div>
          </GlassPanel>

          <aside className="hidden w-full max-w-[400px] shrink-0 flex-col gap-3 lg:flex">
            <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-1">
              <button
                type="button"
                onClick={() => setPanelMode("list")}
                className={cn(
                  "min-h-9 flex-1 rounded-lg px-3 text-xs font-medium",
                  panelMode === "list"
                    ? "bg-[#3B82F6]/20 text-[#F8FAFC]"
                    : "text-[#64748B] hover:text-[#CBD5E1]"
                )}
              >
                {t.map.openList}
              </button>
              <button
                type="button"
                onClick={() => setPanelMode("detail")}
                className={cn(
                  "min-h-9 flex-1 rounded-lg px-3 text-xs font-medium",
                  panelMode === "detail"
                    ? "bg-[#3B82F6]/20 text-[#F8FAFC]"
                    : "text-[#64748B] hover:text-[#CBD5E1]"
                )}
              >
                {t.map.detailsTab}
              </button>
            </div>

            {panelMode === "list" || !selectedItem ? (
              <MapResultsList
                items={visible}
                selectedId={selectedId}
                onSelect={handleSelectItem}
              />
            ) : (
              <MapDetailPanel
                item={selectedItem}
                className="lg:sticky lg:top-24 lg:self-start"
              />
            )}
          </aside>
        </div>
      )}

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
