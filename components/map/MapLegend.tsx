"use client";

import { MARKER_STYLES } from "@/lib/map/map-utils";
import type { MapItemType } from "@/lib/types";

const LEGEND_TYPES: MapItemType[] = [
  "club",
  "member",
  "shop",
  "event",
  "zone",
];

const TYPE_LABELS: Record<MapItemType, string> = {
  club: "C",
  member: "M",
  shop: "S",
  event: "E",
  zone: "Z",
};

export function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/8 bg-[#0B1118]/90 px-3 py-2 text-[10px] text-white/55 backdrop-blur-md">
      {LEGEND_TYPES.map((type) => {
        const style = MARKER_STYLES[type];
        return (
          <span key={type} className="inline-flex items-center gap-1.5">
            <span
              className="inline-flex size-5 items-center justify-center rounded-full border text-[9px] font-bold"
              style={{
                borderColor: style.border,
                color: style.border,
                boxShadow: `0 0 8px ${style.glow}`,
              }}
            >
              {TYPE_LABELS[type]}
            </span>
            <span className="capitalize">{type}</span>
          </span>
        );
      })}
    </div>
  );
}
