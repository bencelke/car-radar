"use client";

import { useMemo, useState } from "react";

import { ClubAreasPanel } from "@/components/dashboard/ClubAreasPanel";
import {
  HowItsBuiltPanel,
  MonetizationPanel,
  ScaledPanel,
  TechStackPanel,
} from "@/components/dashboard/BuildStackPanel";
import { CommunitiesPanel } from "@/components/dashboard/CommunitiesPanel";
import { EventsPanel } from "@/components/dashboard/EventsPanel";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { ShopsPanel } from "@/components/dashboard/ShopsPanel";
import { SubmitPreviewPanel } from "@/components/dashboard/SubmitPreviewPanel";
import { DashboardMapPreview } from "@/components/map/DashboardMapPreview";
import { MapDetailPanel } from "@/components/map/MapDetailPanel";
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
    const filtered = filterMapItems(mapItems, { typeFilter, categoryFilter });
    return sortMapItems(filtered, sortMode);
  }, [mapItems, typeFilter, categoryFilter, sortMode]);

  const selectedItem = useMemo(() => {
    if (!selectedMapItemId) return null;
    return (
      visibleItems.find((i) => i.id === selectedMapItemId) ??
      mapItems.find((i) => i.id === selectedMapItemId) ??
      null
    );
  }, [selectedMapItemId, visibleItems, mapItems]);

  const handleMapItemSelect = (item: MapItem) => {
    setSelectedMapItemId(item.id);
    if (item.id.startsWith("shop-")) {
      setSelectedPinId(item.id.replace(/^shop-/, ""));
    }
  };

  const handlePinSelect = (id: string) => {
    setSelectedPinId(id);
    setSelectedMapItemId(`shop-${id}`);
  };

  return (
    <div className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-4 lg:px-6 lg:py-5">
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="order-2 xl:order-1 xl:sticky xl:top-[4.5rem] xl:self-start">
          <FilterPanel
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            sortMode={sortMode}
            onSortChange={setSortMode}
          />
        </aside>

        <section className="order-1 min-w-0 xl:order-2">
          <DashboardMapPreview
            visibleItems={visibleItems}
            selectedMapItemId={selectedMapItemId}
            onMapItemSelect={handleMapItemSelect}
            mapPins={mapPins}
            selectedPinId={selectedPinId}
            onPinSelect={handlePinSelect}
          />
        </section>

        <aside className="order-3 xl:sticky xl:top-[4.5rem] xl:self-start">
          <MapDetailPanel item={selectedItem} />
        </aside>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <EventsPanel events={events} />
        <ShopsPanel shops={shops} />
        <CommunitiesPanel communities={communities} />
        <ClubAreasPanel clubAreas={clubAreas} />
        <SubmitPreviewPanel />
        <HowItsBuiltPanel />
        <ScaledPanel />
        <TechStackPanel />
        <div className="md:col-span-2 xl:col-span-1 2xl:col-span-2">
          <MonetizationPanel />
        </div>
      </div>
    </div>
  );
}
