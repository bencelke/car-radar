"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { CarEvent } from "@/lib/types";

type EventAttendanceSummaryProps = {
  event: CarEvent;
  goingCount?: number;
  interestedCount?: number;
};

export function EventAttendanceSummary({
  event,
  goingCount,
  interestedCount,
}: EventAttendanceSummaryProps) {
  const { t } = useLocale();
  const going = goingCount ?? event.goingCount ?? 0;
  const interested = interestedCount ?? event.interestedCount ?? 0;
  const max = event.maxAttendance;
  const atCapacity = max != null && max > 0 && going >= max;

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      <span className="rounded-lg border border-[#22C55E]/30 bg-[#22C55E]/10 px-2.5 py-1 text-[#86EFAC]">
        {going.toLocaleString()} {t.community.going}
        {max != null && max > 0 ? ` / ${max}` : ""}
      </span>
      {event.checkInStatus === "open" || (event.checkedInCount ?? 0) > 0 ? (
        <span className="rounded-lg border border-[#A855F7]/30 bg-[#A855F7]/10 px-2.5 py-1 text-[#E9D5FF]">
          {(event.checkedInCount ?? 0).toLocaleString()} {t.checkIn.checkedIn}
        </span>
      ) : null}
      <span className="rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2.5 py-1 text-[#93C5FD]">
        {interested.toLocaleString()} {t.community.interested}
      </span>
      {atCapacity ? (
        <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-200">
          {t.community.eventMayBeFull}
        </span>
      ) : null}
      {event.status === "cancelled" ? (
        <span className="rounded-lg border border-red-500/40 bg-red-500/15 px-2.5 py-1 font-semibold text-red-200">
          {t.community.eventCancelled}
        </span>
      ) : null}
    </div>
  );
}
