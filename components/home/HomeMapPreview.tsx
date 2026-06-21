"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Loader2, MapPin as MapPinIcon } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { accentStyles } from "@/lib/config/accents";
import { brand } from "@/lib/config/brand";
import { getMapboxToken } from "@/lib/map/map-config";
import { filterMapItems } from "@/lib/map/map-utils";
import type { MapFilterId, MapItem, MapPin } from "@/lib/types";
import { cn } from "@/lib/utils";

const CarRadarMap = dynamic(
  () =>
    import("@/components/map/CarRadarMap").then((m) => ({
      default: m.CarRadarMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[280px] items-center justify-center bg-[#05070a]">
        <Loader2 className="size-6 animate-spin text-[#64748B]" />
      </div>
    ),
  }
);

const FILTER_IDS: MapFilterId[] = ["event", "club", "shop", "member"];

function RadarSurface() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-[#05070A]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59,130,246,0.08), transparent 60%),
          radial-gradient(ellipse 50% 40% at 70% 60%, rgba(168,85,247,0.06), transparent 50%),
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "100% 100%, 100% 100%, 40px 40px, 40px 40px",
      }}
    />
  );
}

type HomeMapPreviewProps = {
  mapItems: MapItem[];
  mapPins: MapPin[];
  className?: string;
};

export function HomeMapPreview({
  mapItems,
  mapPins,
  className,
}: HomeMapPreviewProps) {
  const { t } = useLocale();
  const mapboxToken = useMemo(() => getMapboxToken(), []);
  const hasToken = Boolean(mapboxToken);

  const [typeFilter, setTypeFilter] = useState<MapFilterId>("all");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleItems = useMemo(
    () =>
      filterMapItems(mapItems, {
        typeFilter,
        categoryFilter: "all",
        search: "",
      }),
    [mapItems, typeFilter]
  );

  const filterLabels: Record<MapFilterId, string> = {
    all: t.home.filterAll,
    event: t.home.filterEvents,
    club: t.home.filterClubs,
    shop: t.home.filterShops,
    member: t.home.filterBuilds,
    zone: t.home.filterClubs,
  };

  const handlePinSelect = useCallback((id: string) => {
    setSelectedPinId(id);
    setSelectedId(`shop-${id}`);
  }, []);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_55%)]" />

      <div className="relative flex items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2.5 sm:px-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">
            {t.home.radarPanel}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[#CBD5E1]">
            <MapPinIcon className="size-3 text-[#EF4444]" />
            {brand.location.city} / Rhein-Main
          </p>
        </div>
        <Link
          href="/map"
          className="rounded-lg border border-white/[0.1] bg-[#151B24]/90 px-3 py-1.5 text-[11px] font-medium text-[#F8FAFC] transition hover:border-[#3B82F6]/40"
        >
          {t.home.openFullMap}
        </Link>
      </div>

      <div className="relative h-[280px] sm:h-[300px] lg:h-[480px]">
        {!hasToken ? (
          <div className="relative h-full overflow-hidden">
            <RadarSurface />
            {mapPins.slice(0, 8).map((pin) => {
              const accent = accentStyles[pin.accent];
              const selected = selectedPinId === pin.id;
              return (
                <button
                  key={pin.id}
                  type="button"
                  onClick={() => handlePinSelect(pin.id)}
                  style={{ top: pin.position.top, left: pin.position.left }}
                  className={cn(
                    "absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105",
                    selected && "scale-105"
                  )}
                >
                  <span
                    className={cn(
                      "block size-2.5 rounded-full shadow-[0_0_12px_2px]",
                      accent.dot
                    )}
                  />
                </button>
              );
            })}
            <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/[0.06] bg-[#05070a]/90 px-3 py-2 text-center text-[11px] text-[#94A3B8]">
              {t.home.mapTokenMissing}
            </div>
          </div>
        ) : (
          <CarRadarMap
            variant="dashboard"
            accessToken={mapboxToken!}
            items={visibleItems}
            selectedId={selectedId}
            onSelectItem={(item) => setSelectedId(item.id)}
            showCustomControls={false}
            showNativeControls={false}
            showOpenFullMap={false}
            enableInteraction
            enhanceMarkers
            heightClassName="h-full min-h-[280px] lg:min-h-[480px]"
          />
        )}
      </div>

      <div className="relative border-t border-white/[0.06] px-3 py-3 sm:px-4">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTypeFilter("all")}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[10px] font-medium transition",
              typeFilter === "all"
                ? "border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#BFDBFE]"
                : "border-white/[0.08] text-[#94A3B8] hover:border-white/[0.14]"
            )}
          >
            {filterLabels.all}
          </button>
          {FILTER_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTypeFilter(id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-medium transition",
                typeFilter === id
                  ? "border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#BFDBFE]"
                  : "border-white/[0.08] text-[#94A3B8] hover:border-white/[0.14]"
              )}
            >
              {filterLabels[id]}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-[#64748B]">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
            {t.home.legendEvents}
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
            {t.home.legendClubs}
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
            {t.home.legendShops}
          </span>
          <span className="ml-auto">
            {visibleItems.length} {t.home.pinsVisible}
          </span>
        </div>
      </div>
    </div>
  );
}
