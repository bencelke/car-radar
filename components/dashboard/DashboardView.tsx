"use client";

import { useCallback, useMemo, useState } from "react";

import { ClubAreasPanel } from "@/components/dashboard/ClubAreasPanel";
import { CommunitiesPanel } from "@/components/dashboard/CommunitiesPanel";
import { EventsPanel } from "@/components/dashboard/EventsPanel";
import { ShopsPanel } from "@/components/dashboard/ShopsPanel";
import { HomeMapHero } from "@/components/home/HomeMapHero";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { DashboardData } from "@/lib/data/dashboard";
import { filterMapItems, sortMapItems } from "@/lib/map/map-utils";
import type { MapCategoryFilterId, MapFilterId, MapItem, MapSortId } from "@/lib/types";

type DashboardViewProps = DashboardData;

export function DashboardView({
  shops,
  events,
  communities,
  clubAreas,
  mapPins,
  mapItems,
  selectedPlaceId: defaultPlaceId,
}: DashboardViewProps) {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MapFilterId>("all");
  const [categoryFilter, setCategoryFilter] =
    useState<MapCategoryFilterId>("all");
  const [sortMode, setSortMode] = useState<MapSortId>("featured");
  const [selectedMapItemId, setSelectedMapItemId] = useState<string | null>(
    `shop-${defaultPlaceId}`
  );
  const [selectedPinId, setSelectedPinId] = useState<string | null>(
    defaultPlaceId
  );

  const visibleItems = useMemo(() => {
    const filtered = filterMapItems(mapItems, {
      typeFilter,
      categoryFilter,
      search,
    });
    return sortMapItems(filtered, sortMode);
  }, [mapItems, typeFilter, categoryFilter, sortMode, search]);

  const selectedItem = useMemo(() => {
    if (!selectedMapItemId) return null;
    return (
      visibleItems.find((i) => i.id === selectedMapItemId) ??
      mapItems.find((i) => i.id === selectedMapItemId) ??
      null
    );
  }, [selectedMapItemId, visibleItems, mapItems]);

  const handleMapItemSelect = useCallback((item: MapItem) => {
    setSelectedMapItemId(item.id);
    if (item.id.startsWith("shop-")) {
      setSelectedPinId(item.id.replace(/^shop-/, ""));
    }
  }, []);

  const handlePinSelect = useCallback((id: string) => {
    setSelectedPinId(id);
    setSelectedMapItemId(`shop-${id}`);
  }, []);

  const onPulseThisWeekend = useCallback(() => {
    setTypeFilter("event");
    const event = mapItems.find((i) => i.type === "event");
    if (event) handleMapItemSelect(event);
  }, [mapItems, handleMapItemSelect]);

  const onPulseNewShops = useCallback(() => {
    setTypeFilter("shop");
    const shop = mapItems.find((i) => i.type === "shop");
    if (shop) handleMapItemSelect(shop);
  }, [mapItems, handleMapItemSelect]);

  const onPulseFeaturedClubs = useCallback(() => {
    setTypeFilter("club");
    const club = mapItems.find((i) => i.type === "club");
    if (club) handleMapItemSelect(club);
  }, [mapItems, handleMapItemSelect]);

  const onPulseActiveMembers = useCallback(() => {
    setTypeFilter("member");
    const member = mapItems.find((i) => i.type === "member");
    if (member) handleMapItemSelect(member);
  }, [mapItems, handleMapItemSelect]);

  return (
    <div className="flex flex-col">
      <HomeMapHero
        visibleItems={visibleItems}
        mapItems={mapItems}
        selectedMapItemId={selectedMapItemId}
        onMapItemSelect={handleMapItemSelect}
        selectedItem={selectedItem}
        mapPins={mapPins}
        selectedPinId={selectedPinId}
        onPinSelect={handlePinSelect}
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        sortMode={sortMode}
        onSortChange={setSortMode}
        events={events}
        shopCount={shops.length}
        communities={communities}
        onPulseThisWeekend={onPulseThisWeekend}
        onPulseNewShops={onPulseNewShops}
        onPulseFeaturedClubs={onPulseFeaturedClubs}
        onPulseActiveMembers={onPulseActiveMembers}
      />

      <div className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-8 lg:px-6">
        <h2 className="mb-4 font-heading text-xl font-bold tracking-tight text-[#F8FAFC]">
          {t.home.exploreScene}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <EventsPanel events={events} />
          <ShopsPanel shops={shops} />
          <CommunitiesPanel communities={communities} />
          <ClubAreasPanel clubAreas={clubAreas} />
        </div>
      </div>
    </div>
  );
}
