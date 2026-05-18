"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CarRadarMap, type MapLoadStatus } from "@/components/map/CarRadarMap";
import { MapDetailPanel } from "@/components/map/MapDetailPanel";
import { MapFallback } from "@/components/map/MapFallback";
import { MapFilterBar } from "@/components/map/MapFilterBar";
import { MapLegend } from "@/components/map/MapLegend";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  getMapboxToken,
  logMapboxTokenDiagnostic,
  type MapErrorCategory,
} from "@/lib/map/map-config";
import { mapItemMatchesFilter, searchMapItems } from "@/lib/map/map-utils";
import type { MapFilterId, MapItem } from "@/lib/types";

type MapPageClientProps = {
  items: MapItem[];
};

function countByFilter(items: MapItem[]): Record<MapFilterId, number> {
  const base: Record<MapFilterId, number> = {
    all: items.length,
    club: 0,
    member: 0,
    event: 0,
    shop: 0,
    zone: 0,
  };
  for (const item of items) {
    if (item.type === "club") base.club++;
    if (item.type === "member") base.member++;
    if (item.type === "event") base.event++;
    if (item.type === "shop") base.shop++;
    if (item.type === "zone") base.zone++;
  }
  return base;
}

export function MapPageClient({ items }: MapPageClientProps) {
  const { t } = useLocale();
  const [filter, setFilter] = useState<MapFilterId>("all");
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

  const visible = useMemo(
    () => searched.filter((item) => mapItemMatchesFilter(item, filter)),
    [searched, filter]
  );

  const counts = useMemo(() => countByFilter(searched), [searched]);

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
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.map.searchPlaceholder}
            className="w-full rounded-xl border border-white/10 bg-[#0B1118]/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
      </div>

      <MapFilterBar active={filter} counts={counts} onChange={setFilter} />

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
              showControls
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
