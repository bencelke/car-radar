"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";

import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { accentStyles } from "@/lib/config/accents";
import { useLocale } from "@/components/providers/LocaleProvider";
import { eventToEventItem } from "@/lib/mappers/ui";
import type { CarEvent, Club } from "@/lib/types";
import { eventDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type ClubEventsSectionProps = {
  club: Club;
  events: CarEvent[];
};

export function ClubEventsSection({ club, events }: ClubEventsSectionProps) {
  const { t } = useLocale();
  const items = events.map(eventToEventItem);

  return (
    <GlassPanel>
      <PanelHeader
        title={t.clubs.clubEvents}
        action={
          <Link
            href={`/submit?type=event&club=${encodeURIComponent(club.name)}`}
            className="text-[10px] font-medium text-[#3B82F6] hover:underline"
          >
            {t.clubs.submitEventForClub}
          </Link>
        }
      />
      <div className="space-y-2 p-4 pt-0">
        {items.length > 0 ? (
          events.map((source, index) => {
            const event = items[index];
            const accent = accentStyles[event.accent];
            return (
              <Link
                key={event.id}
                href={eventDetailPath(source)}
                className="flex gap-3 rounded-xl border border-white/[0.06] bg-[#151B24]/40 p-2 transition hover:border-white/[0.1]"
              >
                <div
                  className={cn(
                    "h-14 w-12 shrink-0 rounded-lg bg-gradient-to-br",
                    event.gradient
                  )}
                />
                <div>
                  <p className="text-xs font-semibold text-[#F8FAFC]">
                    {event.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#64748B]">
                    <Calendar className="size-3" />
                    {event.date} · {event.time} · {event.city}
                  </p>
                  <p className={cn("mt-1 text-[10px] font-medium", accent.text)}>
                    {event.interested} interested
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="py-6 text-center text-sm text-[#64748B]">
            {t.clubs.noEvents}
          </p>
        )}
      </div>
    </GlassPanel>
  );
}
