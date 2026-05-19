"use client";

import Link from "next/link";
import { Calendar, Users } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { accentStyles } from "@/lib/config/accents";
import { eventToEventItem } from "@/lib/mappers/ui";
import type { CarEvent } from "@/lib/types";
import { eventDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type EventCardProps = {
  event: CarEvent;
};

export function EventCard({ event }: EventCardProps) {
  const { t } = useLocale();
  const item = eventToEventItem(event);
  const accent = accentStyles[item.accent];
  const href = eventDetailPath(event);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl transition hover:border-purple-500/30">
      <div className={cn("h-24 bg-gradient-to-br", item.gradient)} />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-heading text-base font-bold text-[#F8FAFC]">
          {event.title}
        </h3>
        <p className="flex items-center gap-1 text-xs text-[#64748B]">
          <Calendar className="size-3" />
          {item.date} · {item.time}
        </p>
        <p className="text-xs text-[#64748B]">
          {event.type} · {event.city}
        </p>
        <p className={cn("text-xs font-medium", accent.text)}>
          <Users className="mr-1 inline size-3" />
          {item.interested} interested
        </p>
        <div className="mt-auto pt-2">
          <Button
            nativeButton={false}
            render={<Link href={href} />}
            size="sm"
            className="h-8 w-full border border-white/[0.1] bg-[#151B24]/80 text-[#F8FAFC]"
          >
            {t.detail.viewDetails}
          </Button>
        </div>
      </div>
    </article>
  );
}
