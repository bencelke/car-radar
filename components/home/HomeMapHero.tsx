"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";

import { MockMapPanel } from "@/components/dashboard/MockMapPanel";
import { HomeFloatingFilters } from "@/components/home/HomeFloatingFilters";
import { ScenePulseStrip } from "@/components/home/ScenePulseStrip";
import { CarRadarMap, type MapLoadStatus } from "@/components/map/CarRadarMap";
import { MapDetailPanel } from "@/components/map/MapDetailPanel";
import { MapFallback } from "@/components/map/MapFallback";
import { MobileDetailSheet } from "@/components/mobile/MobileDetailSheet";
import { MobileFilterSheet } from "@/components/mobile/MobileFilterSheet";
import { MobileMapToolbar } from "@/components/mobile/MobileMapToolbar";
import { useLocale } from "@/components/providers/LocaleProvider";
import { countActiveMapFilters } from "@/lib/map/active-filter-count";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import {
  getMapboxToken,
  type MapErrorCategory,
} from "@/lib/map/map-config";
import { countMapItemsByType, searchMapItems } from "@/lib/map/map-utils";
import type {
  CommunityItem,
  EventItem,
  MapCategoryFilterId,
  MapFilterId,
  MapItem,
  MapPin,
  MapSortId,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type HomeMapHeroProps = {
  visibleItems: MapItem[];
  mapItems: MapItem[];
  selectedMapItemId: string | null;
  onMapItemSelect: (item: MapItem) => void;
  selectedItem: MapItem | null;
  mapPins: MapPin[];
  selectedPinId: string | null;
  onPinSelect: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: MapFilterId;
  onTypeFilterChange: (id: MapFilterId) => void;
  categoryFilter: MapCategoryFilterId;
  onCategoryFilterChange: (id: MapCategoryFilterId) => void;
  sortMode: MapSortId;
  onSortChange: (sort: MapSortId) => void;
  events: EventItem[];
  shopCount: number;
  communities: CommunityItem[];
  onPulseThisWeekend: () => void;
  onPulseNewShops: () => void;
  onPulseFeaturedClubs: () => void;
  onPulseActiveMembers: () => void;
};

export function HomeMapHero({
  visibleItems,
  mapItems,
  selectedMapItemId,
  onMapItemSelect,
  selectedItem,
  mapPins,
  selectedPinId,
  onPinSelect,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortMode,
  onSortChange,
  events,
  shopCount,
  communities,
  onPulseThisWeekend,
  onPulseNewShops,
  onPulseFeaturedClubs,
  onPulseActiveMembers,
}: HomeMapHeroProps) {
  const { t } = useLocale();
  const mapboxToken = useMemo(() => getMapboxToken(), []);
  const hasToken = Boolean(mapboxToken);

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

  const memberCount = useMemo(
    () => mapItems.filter((i) => i.type === "member").length,
    [mapItems]
  );

  const counts = useMemo(
    () => countMapItemsByType(searchMapItems(mapItems, search)),
    [mapItems, search]
  );

  const activeFilterCount = useMemo(
    () => countActiveMapFilters(typeFilter, categoryFilter, search),
    [typeFilter, categoryFilter, search]
  );

  const fallbackVariant: MapErrorCategory = hasToken
    ? mapErrorCategory
    : "missing-token";

  const heroHeight = cn(
    "mobile-map-viewport--home md:min-h-[620px] lg:min-h-[620px]"
  );

  const detailSheetOpen =
    isMobileLayout &&
    Boolean(selectedItem) &&
    selectedItem?.id !== closedDetailId;

  const handleSelectItem = useCallback(
    (item: MapItem) => {
      onMapItemSelect(item);
      setClosedDetailId(null);
    },
    [onMapItemSelect]
  );

  const handleResetFilters = useCallback(() => {
    onTypeFilterChange("all");
    onCategoryFilterChange("all");
    onSearchChange("");
  }, [onTypeFilterChange, onCategoryFilterChange, onSearchChange]);

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

  const mapBlock = !hasToken || !mapboxToken ? (
    <MockMapPanel
      mapPins={mapPins}
      selectedPinId={selectedPinId}
      onPinSelect={onPinSelect}
    />
  ) : mapStatus === "error" ? (
    <MapFallback variant={fallbackVariant} className={heroHeight} />
  ) : (
    <CarRadarMap
      variant="dashboard"
      accessToken={mapboxToken}
      items={visibleItems}
      selectedId={selectedMapItemId}
      onSelectItem={handleSelectItem}
      onStatusChange={(status, category) => {
        setMapStatus(status);
        if (category) setMapErrorCategory(category);
      }}
      showCustomControls
      showNativeControls={false}
      showOpenFullMap
      fullMapHref="/map"
      enableInteraction
      enhanceMarkers
      heightClassName={cn("h-full", heroHeight)}
      layoutRevision={layoutRevision}
    />
  );

  return (
    <section className="relative w-full">
      <div
        className={cn(
          "relative w-full overflow-hidden bg-[#05070a]",
          heroHeight
        )}
      >
        <div className="absolute inset-0">{mapBlock}</div>

        <div className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-[#05070a]/50 via-transparent to-[#05070a]/90" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-24 bg-gradient-to-b from-[#05070a] to-transparent" />

        {mapStatus === "loading" && hasToken ? (
          <div className="pointer-events-none absolute inset-0 z-[8] flex items-center justify-center bg-[#05070a]/25">
            <p className="text-xs text-white/50">{t.map.mapLoading}</p>
          </div>
        ) : null}

        <MobileMapToolbar
          search={search}
          onSearchChange={onSearchChange}
          onOpenFilters={() => setFilterSheetOpen(true)}
          activeFilterCount={activeFilterCount}
          fullMapHref="/map"
          className="top-2"
        />

        <div className="pointer-events-none absolute inset-0 z-10 hidden flex-col p-3 sm:p-4 md:flex lg:p-5">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="pointer-events-auto hidden w-full max-w-[300px] shrink-0 md:block">
              <HomeFloatingFilters
                search={search}
                onSearchChange={onSearchChange}
                typeFilter={typeFilter}
                onTypeFilterChange={onTypeFilterChange}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={onCategoryFilterChange}
                sortMode={sortMode}
                onSortChange={onSortChange}
                visibleCount={visibleItems.length}
              />
            </div>

            <div className="pointer-events-auto hidden w-full max-w-[340px] shrink-0 lg:block">
              <MapDetailPanel
                item={selectedItem}
                variant="floating"
                className="max-h-[min(480px,calc(100vh-10rem))]"
              />
            </div>
          </div>

          <div className="pointer-events-auto mt-auto hidden pt-3 md:block">
            <ScenePulseStrip
              weekendCount={events.length}
              newShopCount={shopCount}
              featuredClubCount={communities.length}
              activeMemberCount={memberCount}
              onThisWeekend={onPulseThisWeekend}
              onNewShops={onPulseNewShops}
              onFeaturedClubs={onPulseFeaturedClubs}
              onActiveMembers={onPulseActiveMembers}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pt-3 md:hidden">
        <ScenePulseStrip
          weekendCount={events.length}
          newShopCount={shopCount}
          featuredClubCount={communities.length}
          activeMemberCount={memberCount}
          onThisWeekend={onPulseThisWeekend}
          onNewShops={onPulseNewShops}
          onFeaturedClubs={onPulseFeaturedClubs}
          onActiveMembers={onPulseActiveMembers}
        />
        <div className="mt-3 flex justify-end">
          <Link
            href="/map"
            className="inline-flex min-h-11 items-center rounded-full border border-white/[0.12] bg-[#0B1118]/85 px-4 text-xs font-medium text-[#F8FAFC] backdrop-blur-md"
          >
            {t.mobile.openFullMap}
          </Link>
        </div>
      </div>

      <MobileFilterSheet
        open={filterSheetOpen}
        onOpenChange={handleFilterSheetChange}
        typeFilter={typeFilter}
        onTypeFilterChange={onTypeFilterChange}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={onCategoryFilterChange}
        sortMode={sortMode}
        onSortChange={onSortChange}
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
    </section>
  );
}
