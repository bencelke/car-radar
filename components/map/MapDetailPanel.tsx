"use client";

import { ExternalLink, MapPin, Share2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { googleMapsDirectionsUrl } from "@/lib/map/map-utils";
import type { MapItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type MapDetailPanelProps = {
  item: MapItem | null;
  className?: string;
};

function typeLabel(
  item: MapItem,
  t: ReturnType<typeof useLocale>["t"]
): string {
  switch (item.type) {
    case "club":
      return t.map.typeClub;
    case "member":
      return t.map.typeMember;
    case "shop":
      return t.map.typeShop;
    case "event":
      return t.map.typeEvent;
    case "zone":
      return t.map.typeZone;
    default:
      return item.type;
  }
}

function normalizeUrl(url: string): string {
  if (url.startsWith("http") || url.startsWith("//")) return url;
  if (url.startsWith("@")) return `https://instagram.com/${url.slice(1)}`;
  return url;
}

export function MapDetailPanel({ item, className }: MapDetailPanelProps) {
  const { t } = useLocale();

  if (!item) {
    return (
      <GlassPanel
        className={cn(
          "flex min-h-[200px] flex-col items-center justify-center p-6 text-center lg:min-h-0 lg:w-80",
          className
        )}
      >
        <MapPin className="mb-3 size-8 text-white/20" />
        <p className="text-sm text-white/45">{t.map.noSelection}</p>
      </GlassPanel>
    );
  }

  const slug =
    item.type === "club" && typeof item.metadata?.slug === "string"
      ? item.metadata.slug
      : null;

  return (
    <GlassPanel
      className={cn(
        "flex flex-col gap-4 p-5 lg:w-80 lg:shrink-0",
        className
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
            {typeLabel(item, t)}
          </span>
          {item.verified ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
              <ShieldCheck className="size-3" />
              {t.map.verified}
            </span>
          ) : null}
        </div>
        <h2 className="font-heading mt-2 text-lg font-semibold text-white">
          {item.title}
        </h2>
        <p className="mt-1 text-xs text-white/50">
          {item.category} · {item.city}, {item.country}
        </p>
      </div>

      {item.description ? (
        <p className="text-sm leading-relaxed text-white/65">
          {item.description}
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-2">
        <a
          href={googleMapsDirectionsUrl(item.lat, item.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20"
        >
          <ExternalLink className="size-4" />
          {t.map.directions}
        </a>

        {item.website ? (
          <a
            href={normalizeUrl(item.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <ExternalLink className="size-4" />
            {t.map.website}
          </a>
        ) : null}

        {item.instagram ? (
          <a
            href={normalizeUrl(item.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <Share2 className="size-4" />
            {t.map.instagram}
          </a>
        ) : null}

        {slug ? (
          <Link
            href={`/clubs/${slug}`}
            className="text-center text-xs text-blue-400/90 hover:text-blue-300"
          >
            View club →
          </Link>
        ) : null}
      </div>
    </GlassPanel>
  );
}
