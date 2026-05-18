"use client";

import { useEffect, useRef } from "react";

import "mapbox-gl/dist/mapbox-gl.css";

import { createMapMarkerElement } from "@/components/map/MapMarker";
import {
  classifyMapboxError,
  DASHBOARD_FLY_TO_ZOOM,
  DASHBOARD_ZOOM,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  FLY_TO_ZOOM,
  logMapboxTokenDiagnostic,
  MAPBOX_STYLE,
  type MapErrorCategory,
} from "@/lib/map/map-config";
import { MARKER_STYLES } from "@/lib/map/map-utils";
import type { MapFilterId, MapItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export type MapLoadStatus = "loading" | "ready" | "error";
export type CarRadarMapVariant = "full" | "dashboard";

type CarRadarMapProps = {
  accessToken: string;
  items: MapItem[];
  selectedId: string | null;
  onSelect?: (item: MapItem) => void;
  /** Alias for onSelect */
  onSelectItem?: (item: MapItem) => void;
  onStatusChange?: (status: MapLoadStatus, category?: MapErrorCategory) => void;
  variant?: CarRadarMapVariant;
  heightClassName?: string;
  showControls?: boolean;
  showLegend?: boolean;
  enableInteraction?: boolean;
  initialFilter?: MapFilterId;
  enhanceMarkers?: boolean;
};

const ZONES_SOURCE = "carradar-zones";
const ZONES_FILL = "carradar-zones-fill";
const ZONES_STROKE = "carradar-zones-stroke";

function buildZoneGeoJson(zones: MapItem[]) {
  return {
    type: "FeatureCollection" as const,
    features: zones.map((z) => ({
      type: "Feature" as const,
      properties: {
        id: z.id,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [z.lng, z.lat],
      },
    })),
  };
}

function scheduleResize(map: import("mapbox-gl").Map, delay = 100) {
  window.setTimeout(() => {
    try {
      map.resize();
    } catch {
      /* map removed */
    }
  }, delay);
}

export function CarRadarMap({
  accessToken,
  items,
  selectedId,
  onSelect,
  onSelectItem,
  onStatusChange,
  variant = "full",
  heightClassName,
  showControls,
  enableInteraction = true,
  initialFilter: _initialFilter,
  enhanceMarkers = true,
}: CarRadarMapProps) {
  const isDashboard = variant === "dashboard";
  const handleSelect = onSelectItem ?? onSelect ?? (() => undefined);
  const controlsVisible = showControls ?? !isDashboard;
  const shellMinHeight = isDashboard ? "min-h-[420px]" : "min-h-[640px]";

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markersRef = useRef<import("mapbox-gl").Marker[]>([]);
  const mapboxRef = useRef<typeof import("mapbox-gl").default | null>(null);
  const onSelectRef = useRef(handleSelect);
  const itemsRef = useRef(items);
  const onStatusChangeRef = useRef(onStatusChange);
  onSelectRef.current = handleSelect;
  itemsRef.current = items;
  onStatusChangeRef.current = onStatusChange;

  useEffect(() => {
    if (!isDashboard) logMapboxTokenDiagnostic();
  }, [isDashboard]);

  useEffect(() => {
    let cancelled = false;
    onStatusChangeRef.current?.("loading");

    async function init() {
      try {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled || !containerRef.current) return;

        mapboxRef.current = mapboxgl;
        mapboxgl.accessToken = accessToken;

        const map = new mapboxgl.Map({
          container: containerRef.current,
          style: MAPBOX_STYLE,
          center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
          zoom: isDashboard ? DASHBOARD_ZOOM : DEFAULT_ZOOM,
          attributionControl: true,
          scrollZoom: enableInteraction && !isDashboard,
          boxZoom: enableInteraction,
          dragRotate: enableInteraction && !isDashboard,
          dragPan: enableInteraction,
          keyboard: enableInteraction && !isDashboard,
          doubleClickZoom: enableInteraction && !isDashboard,
          touchZoomRotate: enableInteraction,
          cooperativeGestures: isDashboard,
        });

        if (controlsVisible) {
          map.addControl(
            new mapboxgl.NavigationControl({ visualizePitch: false }),
            "top-right"
          );
        }

        const reportError = (error: unknown, fallback: MapErrorCategory) => {
          const category = classifyMapboxError(error);
          if (process.env.NODE_ENV === "development") {
            console.error("[CarRadarMap] Mapbox error", error);
          }
          onStatusChangeRef.current?.(
            "error",
            category === "unknown" ? fallback : category
          );
        };

        map.on("error", (e) => {
          reportError(e.error ?? e, "unknown");
        });

        map.on("style.load", () => {
          if (process.env.NODE_ENV === "development") {
            console.info("[CarRadarMap] Style loaded", { variant });
          }
        });

        map.on("load", () => {
          if (process.env.NODE_ENV === "development") {
            console.info("[CarRadarMap] Map loaded", { variant });
          }

          if (!map.getSource(ZONES_SOURCE)) {
            map.addSource(ZONES_SOURCE, {
              type: "geojson",
              data: buildZoneGeoJson([]),
            });
            map.addLayer({
              id: ZONES_FILL,
              type: "circle",
              source: ZONES_SOURCE,
              paint: {
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  8,
                  18,
                  12,
                  55,
                ],
                "circle-color": "rgba(250, 204, 21, 0.14)",
                "circle-stroke-width": 0,
              },
            });
            map.addLayer({
              id: ZONES_STROKE,
              type: "circle",
              source: ZONES_SOURCE,
              paint: {
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  8,
                  18,
                  12,
                  55,
                ],
                "circle-color": "transparent",
                "circle-stroke-color": MARKER_STYLES.zone.border,
                "circle-stroke-width": 2,
                "circle-opacity": 0.95,
              },
            });
            map.on("click", ZONES_FILL, (e) => {
              const featureId = e.features?.[0]?.properties?.id;
              if (typeof featureId !== "string") return;
              const zone = itemsRef.current.find((i) => i.id === featureId);
              if (zone) onSelectRef.current(zone);
            });
            map.on("mouseenter", ZONES_FILL, () => {
              map.getCanvas().style.cursor = "pointer";
            });
            map.on("mouseleave", ZONES_FILL, () => {
              map.getCanvas().style.cursor = "";
            });
          }

          scheduleResize(map);
          onStatusChangeRef.current?.("ready");
        });

        mapRef.current = map;
        scheduleResize(map, 150);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[CarRadarMap] Map init failed", error);
        }
        onStatusChangeRef.current?.("error", "init-failed");
      }
    }

    void init();

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      mapboxRef.current = null;
    };
  }, [accessToken, isDashboard, controlsVisible, enableInteraction, variant]);

  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl) return;

    const pointItems = items.filter((i) => i.type !== "zone");
    const zoneItems = items.filter((i) => i.type === "zone");

    const sync = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      for (const item of pointItems) {
        const el = createMapMarkerElement(
          item,
          selectedId === item.id,
          () => onSelectRef.current(item),
          { enhanced: enhanceMarkers }
        );
        const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([item.lng, item.lat])
          .addTo(map);
        markersRef.current.push(marker);
      }

      const source = map.getSource(ZONES_SOURCE) as
        | import("mapbox-gl").GeoJSONSource
        | undefined;
      if (source) {
        source.setData(buildZoneGeoJson(zoneItems));
      }
    };

    if (map.isStyleLoaded()) {
      sync();
    } else {
      map.once("load", sync);
    }
  }, [items, selectedId, enhanceMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const item = items.find((i) => i.id === selectedId);
    if (!item) return;
    map.flyTo({
      center: [item.lng, item.lat],
      zoom: isDashboard ? DASHBOARD_FLY_TO_ZOOM : FLY_TO_ZOOM,
      duration: isDashboard ? 900 : 1200,
      essential: true,
    });
  }, [selectedId, items, isDashboard]);

  useEffect(() => {
    const map = mapRef.current;
    const el = containerRef.current;
    if (!map || !el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => scheduleResize(map, 50));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "carradar-map-shell absolute inset-0 h-full w-full",
        shellMinHeight,
        isDashboard && "carradar-map-shell--dashboard",
        heightClassName
      )}
      aria-label="CarRadar map"
    >
      {isDashboard ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#05070a]/25 via-transparent to-[#05070a]/45"
          aria-hidden
        />
      ) : null}
      <div
        ref={containerRef}
        className={cn(
          "carradar-map relative z-0 h-full w-full",
          shellMinHeight,
          enhanceMarkers && "carradar-map--enhanced",
          isDashboard ? "carradar-map--dashboard" : "carradar-map--full",
          heightClassName
        )}
      />
    </div>
  );
}

