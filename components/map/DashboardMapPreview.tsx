"use client";

import { useMemo, useState } from "react";

import { MockMapPanel } from "@/components/dashboard/MockMapPanel";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { CarRadarMap, type MapLoadStatus } from "@/components/map/CarRadarMap";
import { MapFallback } from "@/components/map/MapFallback";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  getMapboxToken,
  type MapErrorCategory,
} from "@/lib/map/map-config";
import { filterMapItemsForDashboard } from "@/lib/map/map-utils";
import { dashboardStats } from "@/lib/mock-data/car-radar";
import type { MapItem, MapPin } from "@/lib/types";

type DashboardMapPreviewProps = {
  mapItems: MapItem[];
  activeFilter: string;
  selectedMapItemId: string | null;
  onMapItemSelect: (item: MapItem) => void;
  /** Legacy mock fallback when token is missing */
  mapPins: MapPin[];
  selectedPinId: string | null;
  onPinSelect: (id: string) => void;
};

export function DashboardMapPreview({
  mapItems,
  activeFilter,
  selectedMapItemId,
  onMapItemSelect,
  mapPins,
  selectedPinId,
  onPinSelect,
}: DashboardMapPreviewProps) {
  const { t } = useLocale();
  const mapboxToken = useMemo(() => getMapboxToken(), []);
  const hasToken = Boolean(mapboxToken);

  const [mapStatus, setMapStatus] = useState<MapLoadStatus>("loading");
  const [mapErrorCategory, setMapErrorCategory] =
    useState<MapErrorCategory>("unknown");

  const visibleItems = useMemo(
    () => filterMapItemsForDashboard(mapItems, activeFilter),
    [mapItems, activeFilter]
  );

  const fallbackVariant: MapErrorCategory = hasToken
    ? mapErrorCategory
    : "missing-token";

  if (!hasToken || !mapboxToken) {
    return (
      <MockMapPanel
        mapPins={mapPins}
        selectedPinId={selectedPinId}
        onPinSelect={onPinSelect}
      />
    );
  }

  if (mapStatus === "error") {
    return (
      <MapFallback variant={fallbackVariant} className="min-h-[420px] lg:min-h-[520px]" />
    );
  }

  return (
    <GlassPanel className="relative flex min-h-[420px] flex-col overflow-hidden lg:min-h-[520px]">
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
        showControls={false}
        enableInteraction
        enhanceMarkers
        heightClassName="min-h-[420px] lg:min-h-[520px]"
      />

      <div className="pointer-events-none absolute inset-0 z-10 p-3">
        <div className="grid max-w-[140px] grid-cols-1 gap-2 sm:max-w-none sm:grid-cols-2 lg:grid-cols-2">
          {dashboardStats.map((stat) => (
            <div key={stat.id} className="pointer-events-auto">
              <StatCard stat={stat} />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <button
          type="button"
          className="rounded-full border border-white/[0.1] bg-[#111827]/90 px-4 py-2 text-xs font-medium text-[#F8FAFC] backdrop-blur-md transition hover:border-[#3B82F6]/40 hover:shadow-[0_0_20px_-6px_rgba(59,130,246,0.4)]"
        >
          {t.map.searchThisArea}
        </button>
      </div>

      {mapStatus === "loading" ? (
        <div className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center bg-[#05070a]/35">
          <p className="text-xs text-white/50">{t.map.mapLoading}</p>
        </div>
      ) : null}
    </GlassPanel>
  );
}
