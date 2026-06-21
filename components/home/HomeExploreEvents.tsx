"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

import { HomeEmptyPanel } from "@/components/home/HomeEmptyPanel";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useLocale } from "@/components/providers/LocaleProvider";
import { accentStyles } from "@/lib/config/accents";
import { eventToEventItem } from "@/lib/mappers/ui";
import type { CarEvent } from "@/lib/types";
import { eventDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type HomeExploreEventsProps = {
  events: CarEvent[];
};

function EventDiscoveryCard({ event }: { event: CarEvent }) {
  const { t } = useLocale();
  const item = eventToEventItem(event);
  const accent = accentStyles[item.accent];

  return (
    <Link
      href={eventDetailPath(event)}
      className="group flex min-h-[88px] gap-3 rounded-xl border border-white/[0.06] bg-[#0B1118]/70 p-3 transition hover:border-orange-500/25 hover:bg-[#151B24]/80 active:scale-[0.99]"
    >
      <div
        className={cn(
          "flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br text-center",
          item.gradient
        )}
      >
        <span className="text-[9px] font-bold uppercase leading-tight text-white/90">
          {item.date.split(" ").slice(-2).join(" ")}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-[#F8FAFC] group-hover:text-white">
          {event.title}
        </h4>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-[#64748B]">
          <MapPin className="size-3 shrink-0" />
          {event.city}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-[#64748B]">
          {event.type ? (
            <span className="rounded bg-white/[0.06] px-1.5 py-0.5 capitalize">
              {event.type}
            </span>
          ) : null}
          {event.clubName ? (
            <span className="truncate">{event.clubName}</span>
          ) : null}
        </div>
        {event.interestedCount != null && event.interestedCount > 0 ? (
          <p className={cn("mt-1 text-[10px] font-medium", accent.text)}>
            {event.interestedCount} {t.home.interested}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function HomeExploreEvents({ events }: HomeExploreEventsProps) {
  const { t } = useLocale();

  const upcoming = events
    .filter((e) => new Date(e.startTime).getTime() >= Date.now())
    .slice(0, 4);

  return (
    <section>
      <HomeSectionHeader
        title={t.home.exploreEvents}
        href="/events"
        actionLabel={t.home.viewAllEvents}
      />
      {upcoming.length === 0 ? (
        <HomeEmptyPanel
          message={t.home.noEventsThisWeek}
          actionLabel={t.home.submitMeet}
          actionHref="/submit?type=event"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((event) => (
            <EventDiscoveryCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
