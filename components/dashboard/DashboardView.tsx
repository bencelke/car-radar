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
import { MockMapPanel } from "@/components/dashboard/MockMapPanel";
import { PlaceDetailPanel } from "@/components/dashboard/PlaceDetailPanel";
import { ShopsPanel } from "@/components/dashboard/ShopsPanel";
import { SubmitPreviewPanel } from "@/components/dashboard/SubmitPreviewPanel";
import type { DashboardData } from "@/lib/data/dashboard";

type DashboardViewProps = DashboardData;

export function DashboardView({
  shops,
  events,
  communities,
  clubAreas,
  places,
  mapPins,
  selectedPlaceId: defaultPlaceId,
}: DashboardViewProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(
    defaultPlaceId
  );

  const selectedPlace = useMemo(() => {
    const byId = places.find((p) => p.id === selectedPinId);
    if (byId) return byId;
    const pin = mapPins.find((p) => p.id === selectedPinId);
    if (pin) {
      return (
        places.find((p) => p.name === pin.name) ??
        places.find((p) => p.id === defaultPlaceId) ??
        places[0]
      );
    }
    return places[0];
  }, [selectedPinId, places, mapPins, defaultPlaceId]);

  return (
    <div className="mx-auto w-full max-w-[1920px] flex-1 px-4 py-4 lg:px-6 lg:py-5">
      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="order-2 xl:order-1 xl:sticky xl:top-[4.5rem] xl:self-start">
          <FilterPanel
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </aside>

        <section className="order-1 min-w-0 xl:order-2">
          <MockMapPanel
            selectedPinId={selectedPinId}
            onPinSelect={setSelectedPinId}
            mapPins={mapPins}
          />
        </section>

        <aside className="order-3 xl:sticky xl:top-[4.5rem] xl:self-start">
          {selectedPlace ? (
            <PlaceDetailPanel place={selectedPlace} />
          ) : null}
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
