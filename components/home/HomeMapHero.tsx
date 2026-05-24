"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { MockMapPanel } from "@/components/dashboard/MockMapPanel";
import { HomeFloatingFilters } from "@/components/home/HomeFloatingFilters";
import { ScenePulseStrip } from "@/components/home/ScenePulseStrip";
import { CarRadarMap, type MapLoadStatus } from "@/components/map/CarRadarMap";
import { MapDetailPanel } from "@/components/map/MapDetailPanel";
import { MapFallback } from "@/components/map/MapFallback";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  getMapboxToken,
  type MapErrorCategory,
} from "@/lib/map/map-config";
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

  const memberCount = useMemo(
    () => mapItems.filter((i) => i.type === "member").length,
    [mapItems]
  );

  const fallbackVariant: MapErrorCategory = hasToken
    ? mapErrorCategory
    : "missing-token";

  const heroHeight =
    "min-h-[min(520px,78vh)] lg:min-h-[620px]";

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
      onSelectItem={onMapItemSelect}
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

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-3 sm:p-4 lg:p-5">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="pointer-events-auto w-full max-w-[300px] shrink-0">
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

          <div className="pointer-events-auto mt-auto pt-3">
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

        <div className="absolute bottom-[7.5rem] right-4 z-20 hidden sm:block lg:bottom-28">
          <Link
            href="/map"
            className="rounded-full border border-white/[0.12] bg-[#0B1118]/85 px-4 py-2 text-xs font-medium text-[#F8FAFC] backdrop-blur-md transition hover:border-[#3B82F6]/40 hover:shadow-[0_0_20px_-6px_rgba(59,130,246,0.4)]"
          >
            {t.map.openFullMap}
          </Link>
        </div>
      </div>

      <div className="px-4 pb-2 pt-3 lg:hidden">
        <MapDetailPanel item={selectedItem} variant="floating" />
      </div>
    </section>
  );
}
