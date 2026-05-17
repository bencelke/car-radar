import Link from "next/link";
import { Calendar, Users } from "lucide-react";

import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { accentStyles } from "@/lib/config/accents";
import type { EventItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type EventsPanelProps = {
  events: EventItem[];
};

export function EventsPanel({ events }: EventsPanelProps) {
  return (
    <GlassPanel className="flex flex-col">
      <PanelHeader
        title="Events"
        action={
          <Link
            href="/events"
            className="text-[10px] font-medium text-[#3B82F6] hover:underline"
          >
            View all
          </Link>
        }
      />
      <div className="border-b border-white/[0.06] px-4 pb-3">
        <input
          type="search"
          placeholder="Search events..."
          className="h-8 w-full rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 text-xs text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#3B82F6]/40"
        />
      </div>
      <div className="flex flex-col gap-3 p-4">
        {events.map((event) => {
          const accent = accentStyles[event.accent];
          return (
            <article
              key={event.id}
              className="group flex gap-3 rounded-xl border border-white/[0.06] bg-[#151B24]/40 p-2 transition hover:border-white/[0.1] hover:bg-[#151B24]/80"
            >
              <div
                className={cn(
                  "h-16 w-14 shrink-0 rounded-lg bg-gradient-to-br",
                  event.gradient
                )}
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-xs font-semibold text-[#F8FAFC]">
                  {event.title}
                </h4>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#64748B]">
                  <Calendar className="size-3" />
                  {event.date} · {event.time}
                </p>
                <p className="text-[10px] text-[#64748B]">{event.city}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span
                    className={cn(
                      "flex items-center gap-1 text-[10px] font-medium",
                      accent.text
                    )}
                  >
                    <Users className="size-3" />
                    {event.interested} interested
                  </span>
                  <div className="flex -space-x-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "size-5 rounded-full border-2 border-[#0B1118] bg-gradient-to-br",
                          i === 0 && "from-[#EF4444]/60 to-orange-600/40",
                          i === 1 && "from-[#3B82F6]/60 to-purple-600/40",
                          i === 2 && "from-[#22C55E]/60 to-emerald-600/40"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="border-t border-white/[0.06] p-3">
        <Link
          href="/events"
          className="flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-[#151B24]/60 py-2 text-xs font-medium text-[#CBD5E1] transition hover:border-[#3B82F6]/30 hover:text-[#F8FAFC]"
        >
          View all events
        </Link>
      </div>
    </GlassPanel>
  );
}
