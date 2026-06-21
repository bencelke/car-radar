"use client";

import Link from "next/link";
import { Calendar, ExternalLink, Share2, Users } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { accentStyles } from "@/lib/config/accents";
import { eventToEventItem } from "@/lib/mappers/ui";
import { googleMapsDirectionsUrl } from "@/lib/map/map-utils";
import type { CarEvent } from "@/lib/types";
import { eventDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type EventCardProps = {
  event: CarEvent;
  className?: string;
};

export function EventCard({ event, className }: EventCardProps) {
  const { t } = useLocale();
  const item = eventToEventItem(event);
  const accent = accentStyles[item.accent];
  const href = eventDetailPath(event);
  const interested = event.interestedCount ?? 0;

  return (
    <article
      className={cn(
        "group flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl transition hover:border-purple-500/30",
        className
      )}
    >
      <Link href={href} className="block">
        <div className="relative h-20 overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br transition group-hover:brightness-110",
              item.gradient
            )}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/35 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/85 backdrop-blur-sm">
            {event.type}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 p-4 pb-0">
          <h3 className="font-heading line-clamp-2 text-base font-bold text-[#F8FAFC] group-hover:text-white">
            {event.title}
          </h3>
          <p className="flex items-center gap-1 text-xs text-[#64748B]">
            <Calendar className="size-3 shrink-0" />
            {item.date} · {item.time}
          </p>
          <p className="text-xs text-[#64748B]">{event.city}</p>
          {interested > 0 ? (
            <p className={cn("text-xs font-medium", accent.text)}>
              <Users className="mr-1 inline size-3" />
              {interested.toLocaleString()} {t.community.interested}
            </p>
          ) : null}
        </div>
      </Link>
      <div className="mt-auto p-4 pt-2">
        <Button
          nativeButton={false}
          render={<Link href={href} />}
          size="sm"
          className="h-11 w-full border border-white/[0.1] bg-[#151B24]/80 text-[#F8FAFC]"
        >
          {t.detail.viewDetails}
        </Button>
      </div>
    </article>
  );
}
