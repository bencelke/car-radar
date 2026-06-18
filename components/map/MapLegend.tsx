"use client";

import { getMarkerIconSvg } from "@/lib/map/marker-icons";
import { MARKER_STYLES } from "@/lib/map/map-utils";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { MapItemType } from "@/lib/types";

const LEGEND_TYPES: MapItemType[] = [
  "shop",
  "event",
  "club",
  "zone",
];

const LEGEND_LABEL_KEYS: Record<
  MapItemType,
  keyof typeof import("@/lib/i18n/en").en.map
> = {
  member: "legendMembers",
  shop: "legendShops",
  event: "legendEvents",
  club: "legendClubs",
  zone: "legendZones",
};

export function MapLegend() {
  const { t } = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/8 bg-[#0B1118]/90 px-3 py-2 text-[10px] text-white/55 backdrop-blur-md">
      {LEGEND_TYPES.map((type) => {
        const style = MARKER_STYLES[type];
        return (
          <span key={type} className="inline-flex items-center gap-1.5">
            <span
              className="inline-flex size-5 items-center justify-center rounded-full border"
              style={{
                borderColor: style.border,
                boxShadow: `0 0 8px ${style.glow}`,
              }}
              dangerouslySetInnerHTML={{
                __html: getMarkerIconSvg(type, style.iconColor, 11),
              }}
            />
            <span>{t.map[LEGEND_LABEL_KEYS[type]]}</span>
          </span>
        );
      })}
    </div>
  );
}
