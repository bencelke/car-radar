"use client";

import { ExternalLink, MapPin, Plus, Share2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { EmptyStateCard } from "@/components/layout/EmptyStateCard";
import { MapMemberDetail } from "@/components/map/MapMemberDetail";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { submitRoute } from "@/lib/config/routes";
import { claimPagePath } from "@/lib/claims/claim-utils";
import {
  googleMapsDirectionsUrl,
  metaNumber,
  metaString,
} from "@/lib/map/map-utils";
import type { MapItem } from "@/lib/types";
import { mapItemDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type MapDetailPanelProps = {
  item: MapItem | null;
  className?: string;
  variant?: "default" | "floating";
};

const floatingPanelClass =
  "border-white/10 bg-[#05070a]/85 shadow-[0_12px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl";

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

function formatEventTime(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


export function MapDetailPanel({
  item,
  className,
  variant = "default",
}: MapDetailPanelProps) {
  const { t } = useLocale();
  const isFloating = variant === "floating";
  const panelExtras = isFloating ? floatingPanelClass : undefined;

  if (!item) {
    return (
      <EmptyStateCard
        icon={MapPin}
        title={t.map.selectMarker}
        description={t.map.selectMarkerHint}
        actions={[
          {
            label: t.map.submitPlace,
            href: submitRoute(),
            variant: "primary",
          },
        ]}
        className={cn("min-h-[280px] lg:min-h-[360px]", panelExtras, className)}
      />
    );
  }

  if (item.type === "member") {
    return (
      <GlassPanel
        className={cn(
          "flex max-h-[min(640px,calc(100vh-12rem))] flex-col gap-4 overflow-y-auto p-5",
          panelExtras,
          className
        )}
      >
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
        <MapMemberDetail item={item} />
      </GlassPanel>
    );
  }

  const detailHref = mapItemDetailPath(item);
  const buildTags = metaString(item, "buildTags");
  const services = metaString(item, "services");
  const rating = metaNumber(item, "rating");
  const interested = metaNumber(item, "interestedCount");
  const going = metaNumber(item, "goingCount");
  const memberCount = metaNumber(item, "memberCount");
  const organizer = metaString(item, "organizerName");
  const startTime = formatEventTime(metaString(item, "startTime"));
  const statusLabel = metaString(item, "statusLabel");

  return (
    <GlassPanel
      className={cn(
        "flex max-h-[min(640px,calc(100vh-12rem))] flex-col gap-4 overflow-y-auto p-5",
        panelExtras,
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
          {statusLabel ? (
            <span className="text-[10px] text-blue-300/90">{statusLabel}</span>
          ) : null}
        </div>
        <h2 className="font-heading mt-2 text-lg font-semibold text-[#F8FAFC]">
          {item.title}
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          {item.category}
          {item.area ? ` · ${item.area}` : ""} · {item.city}, {item.country}
        </p>
      </div>

      {item.description ? (
        <p className="text-sm leading-relaxed text-[#94A3B8]">{item.description}</p>
      ) : null}

      {startTime ? (
        <p className="text-xs text-purple-200/80">{startTime}</p>
      ) : null}

      {going != null && going > 0 ? (
        <p className="text-xs text-[#86EFAC]">
          {going.toLocaleString()} {t.community.going}
        </p>
      ) : null}

      {interested != null && interested > 0 ? (
        <p className="text-xs text-[#93C5FD]">
          {interested.toLocaleString()} {t.community.interested}
        </p>
      ) : null}

      {memberCount != null && memberCount > 0 ? (
        <p className="text-xs text-[#64748B]">
          {memberCount.toLocaleString()} {t.clubs.members}
        </p>
      ) : null}

      {buildTags ? (
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {t.map.buildLabel}
          </p>
          <p className="text-xs text-[#94A3B8]">{buildTags}</p>
        </div>
      ) : null}

      {services ? (
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {t.map.servicesLabel}
          </p>
          <p className="text-xs text-[#94A3B8]">{services}</p>
        </div>
      ) : null}

      {rating != null && rating > 0 ? (
        <p className="text-xs text-amber-200/90">★ {rating.toFixed(1)}</p>
      ) : null}

      {organizer ? (
        <p className="text-xs text-[#64748B]">{organizer}</p>
      ) : null}

      {item.tags && item.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/8 bg-white/5 px-2 py-0.5 text-[10px] text-[#94A3B8]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-2 pt-2">
        {detailHref ? (
          <Button
            nativeButton={false}
            render={<Link href={detailHref} />}
            size="sm"
            className="min-h-11 w-full border border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC] hover:bg-[#EF4444]/25"
          >
            {item.type === "club" ? t.clubs.viewClub : t.detail.viewDetails}
          </Button>
        ) : null}

        <a
          href={googleMapsDirectionsUrl(item.lat, item.lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20"
        >
          <ExternalLink className="size-4" />
          {t.map.directions}
        </a>

        {item.website ? (
          <a
            href={normalizeUrl(item.website)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#CBD5E1] hover:bg-white/10"
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#CBD5E1] hover:bg-white/10"
          >
            <Share2 className="size-4" />
            {t.map.instagram}
          </a>
        ) : null}

        {item.type === "club" && !item.verified ? (
          <Button
            nativeButton={false}
            render={
              <Link
                href={claimPagePath(
                  "club",
                  metaString(item, "entityId") ??
                    item.id.replace(/^(shop|event|club|member|zone)-/, "")
                )}
              />
            }
            size="sm"
            variant="outline"
            className="min-h-11 w-full border-white/[0.1] bg-[#151B24]/80 text-[#CBD5E1]"
          >
            <Plus className="mr-1.5 size-4" />
            {t.claims.claimThisClub}
          </Button>
        ) : null}
      </div>
    </GlassPanel>
  );
}
