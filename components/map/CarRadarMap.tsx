"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import "mapbox-gl/dist/mapbox-gl.css";

import { MapControls } from "@/components/map/MapControls";
import { MemberMapHoverPreview } from "@/components/map/MemberMapHoverPreview";
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
  resolveMapInteractions,
  type MapErrorCategory,
  type MapInteractionOverrides,
} from "@/lib/map/map-config";
import { useLocale } from "@/components/providers/LocaleProvider";
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
  /** @deprecated Prefer showNativeControls */
  showControls?: boolean;
  showNativeControls?: boolean;
  showCustomControls?: boolean;
  showOpenFullMap?: boolean;
  fullMapHref?: string;
  showLegend?: boolean;
  enableInteraction?: boolean;
  /** Wheel / trackpad zoom (default: true for full and dashboard). */
  enableScrollZoom?: boolean;
  /** When true, zoom requires Ctrl/Cmd + scroll (smoother page scroll on dashboard). */
  cooperativeGestures?: boolean;
  enableDoubleClickZoom?: boolean;
  enableDragPan?: boolean;
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

function applyMapInteractions(
  map: import("mapbox-gl").Map,
  interactions: ReturnType<typeof resolveMapInteractions>
) {
  if (interactions.scrollZoom) map.scrollZoom.enable();
  else map.scrollZoom.disable();

  if (interactions.doubleClickZoom) map.doubleClickZoom.enable();
  else map.doubleClickZoom.disable();

  if (interactions.dragPan) map.dragPan.enable();
  else map.dragPan.disable();

  if (interactions.touchZoomRotate) map.touchZoomRotate.enable();
  else map.touchZoomRotate.disable();

  if (interactions.boxZoom) map.boxZoom.enable();
  else map.boxZoom.disable();

  if (interactions.keyboard) map.keyboard.enable();
  else map.keyboard.disable();

  if (interactions.dragRotate) map.dragRotate.enable();
  else map.dragRotate.disable();
}

function bindMapCursor(
  map: import("mapbox-gl").Map,
  container: HTMLDivElement,
  dragPanEnabled: boolean
): () => void {
  if (!dragPanEnabled) {
    container.classList.remove("carradar-map--interactive", "carradar-map--grabbing");
    return () => {};
  }

  container.classList.add("carradar-map--interactive");

  const onDragStart = () => container.classList.add("carradar-map--grabbing");
  const onDragEnd = () => container.classList.remove("carradar-map--grabbing");

  map.on("dragstart", onDragStart);
  map.on("dragend", onDragEnd);

  return () => {
    map.off("dragstart", onDragStart);
    map.off("dragend", onDragEnd);
    container.classList.remove("carradar-map--interactive", "carradar-map--grabbing");
  };
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
  showNativeControls,
  showCustomControls,
  showOpenFullMap,
  fullMapHref = "/map",
  enableInteraction = true,
  enableScrollZoom,
  cooperativeGestures,
  enableDoubleClickZoom,
  enableDragPan,
  initialFilter: _initialFilter,
  enhanceMarkers = true,
}: CarRadarMapProps) {
  const { t } = useLocale();
  const isDashboard = variant === "dashboard";

  const interactions = useMemo(() => {
    const overrides: MapInteractionOverrides = {};
    if (enableScrollZoom !== undefined) overrides.scrollZoom = enableScrollZoom;
    if (cooperativeGestures !== undefined) {
      overrides.cooperativeGestures = cooperativeGestures;
    }
    if (enableDoubleClickZoom !== undefined) {
      overrides.doubleClickZoom = enableDoubleClickZoom;
    }
    if (enableDragPan !== undefined) overrides.dragPan = enableDragPan;
    return resolveMapInteractions(variant, enableInteraction, overrides);
  }, [
    variant,
    enableInteraction,
    enableScrollZoom,
    cooperativeGestures,
    enableDoubleClickZoom,
    enableDragPan,
  ]);
  const handleSelect = onSelectItem ?? onSelect ?? (() => undefined);
  const useCustomControls = showCustomControls ?? isDashboard;
  const useNativeControls =
    showNativeControls ??
    (showControls !== false && variant === "full" && !useCustomControls);
  const shellMinHeight = isDashboard ? "min-h-[420px]" : "min-h-[640px]";
  const [mapReady, setMapReady] = useState(false);
  const [hoveredMember, setHoveredMember] = useState<MapItem | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const cursorCleanupRef = useRef<(() => void) | null>(null);
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
          scrollZoom: interactions.scrollZoom,
          boxZoom: interactions.boxZoom,
          dragRotate: interactions.dragRotate,
          dragPan: interactions.dragPan,
          keyboard: interactions.keyboard,
          doubleClickZoom: interactions.doubleClickZoom,
          touchZoomRotate: interactions.touchZoomRotate,
          cooperativeGestures: interactions.cooperativeGestures,
        });

        if (useNativeControls) {
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
                "circle-color": "rgba(250, 204, 21, 0.08)",
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
                "circle-stroke-width": 1.5,
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

          applyMapInteractions(map, interactions);
          if (containerRef.current) {
            cursorCleanupRef.current?.();
            cursorCleanupRef.current = bindMapCursor(
              map,
              containerRef.current,
              interactions.dragPan
            );
          }

          scheduleResize(map);
          setMapReady(true);
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
      setMapReady(false);
      cursorCleanupRef.current?.();
      cursorCleanupRef.current = null;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      mapboxRef.current = null;
    };
  }, [accessToken, isDashboard, useNativeControls, enableInteraction, variant]);

  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!map || !mapReady) return;

    const apply = () => {
      applyMapInteractions(map, interactions);
      cursorCleanupRef.current?.();
      cursorCleanupRef.current = container
        ? bindMapCursor(map, container, interactions.dragPan)
        : null;
    };

    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);

    return () => {
      cursorCleanupRef.current?.();
      cursorCleanupRef.current = null;
    };
  }, [mapReady, interactions]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 280 });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 280 });
  }, []);

  const handleRecenter = useCallback(() => {
    mapRef.current?.flyTo({
      center: [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat],
      zoom: isDashboard ? DASHBOARD_ZOOM : DEFAULT_ZOOM,
      duration: 900,
      essential: true,
    });
  }, [isDashboard]);

  const positionHoverCard = useCallback((item: MapItem) => {
    const map = mapRef.current;
    if (!map) return;
    const p = map.project([item.lng, item.lat]);
    setHoverPoint({ x: p.x, y: p.y });
  }, []);

  const clearHover = useCallback(() => {
    setHoveredMember(null);
    setHoverPoint(null);
  }, []);

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
          {
            enhanced: enhanceMarkers,
            onMouseEnter:
              item.type === "member"
                ? () => {
                    setHoveredMember(item);
                    positionHoverCard(item);
                  }
                : undefined,
            onMouseLeave:
              item.type === "member" ? clearHover : undefined,
          }
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
  }, [items, selectedId, enhanceMarkers, positionHoverCard, clearHover]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const onMove = () => clearHover();
    map.on("move", onMove);
    map.on("zoom", onMove);
    return () => {
      map.off("move", onMove);
      map.off("zoom", onMove);
    };
  }, [mapReady, clearHover]);

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
        "carradar-map-shell relative absolute inset-0 h-full w-full",
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
      {hoveredMember && hoverPoint ? (
        <MemberMapHoverPreview
          item={hoveredMember}
          style={{ left: hoverPoint.x, top: hoverPoint.y }}
        />
      ) : null}
      {isDashboard && mapReady ? (
        <p
          className="pointer-events-none absolute bottom-14 left-3 z-[20] max-w-[200px] rounded-lg border border-white/10 bg-[#0B1118]/85 px-2.5 py-1.5 text-[10px] leading-snug text-white/55 backdrop-blur-md"
          aria-hidden
        >
          {interactions.cooperativeGestures
            ? t.map.interactionHintCooperative
            : t.map.interactionHint}
        </p>
      ) : null}
      {useCustomControls && mapReady ? (
        <MapControls
          variant={variant}
          className="absolute right-3 top-1/2 z-[25] -translate-y-1/2"
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRecenter={handleRecenter}
          fullMapHref={showOpenFullMap ? fullMapHref : undefined}
        />
      ) : null}
    </div>
  );
}

