"use client";

import Link from "next/link";
import { Calendar, MapPin, Users } from "lucide-react";

import { HomeEmptyPanel } from "@/components/home/HomeEmptyPanel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { accentStyles } from "@/lib/config/accents";
import { eventToEventItem } from "@/lib/mappers/ui";
import type { CarEvent } from "@/lib/types";
import { eventDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type HomeFeaturedEventProps = {
  event: CarEvent | null;
  className?: string;
};

export function HomeFeaturedEvent({ event, className }: HomeFeaturedEventProps) {
  const { t } = useLocale();

  if (!event) {
    return (
      <HomeEmptyPanel
        message={t.home.noUpcomingEvents}
        actionLabel={t.home.submitMeet}
        actionHref="/submit?type=event"
        className={className}
      />
    );
  }

  const item = eventToEventItem(event);
  const accent = accentStyles[item.accent];
  const href = eventDetailPath(event);
  const hasInterest =
    event.interestedCount != null && event.interestedCount > 0;

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#151B24] via-[#0B1118] to-[#05070a]",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-400/90">
            {t.home.nextUp}
          </p>
          <h3 className="mt-2 font-heading text-xl font-bold text-[#F8FAFC] sm:text-2xl">
            {event.title}
          </h3>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" />
              {item.date}
              {item.time ? ` · ${item.time}` : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              {event.city}
            </span>
            {event.clubName ? (
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5 shrink-0" />
                {event.clubName}
              </span>
            ) : null}
            {event.type ? (
              <span className="rounded bg-white/[0.06] px-2 py-0.5 text-xs capitalize">
                {event.type}
              </span>
            ) : null}
          </div>
          {hasInterest ? (
            <p className={cn("mt-2 text-xs font-medium", accent.text)}>
              {event.interestedCount} {t.home.interested}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Link
            href={href}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-orange-600 to-red-600 px-5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            {t.home.viewEvent}
          </Link>
          <Link
            href={href}
            className="text-center text-xs text-[#64748B] hover:text-[#93C5FD]"
          >
            {t.home.addToPlan}
          </Link>
        </div>
      </div>
    </article>
  );
}
