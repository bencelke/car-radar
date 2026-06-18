"use client";

import type { CarEvent } from "@/lib/types";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type EventCheckInStatusProps = {
  event: CarEvent;
  userCheckedInAt?: string | null;
  className?: string;
};

export function EventCheckInStatus({
  event,
  userCheckedInAt,
  className,
}: EventCheckInStatusProps) {
  const { t } = useLocale();
  const open = event.checkInStatus === "open";
  const showAggregate =
    open || (event.checkedInCount != null && event.checkedInCount > 0);

  if (!showAggregate && !userCheckedInAt) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {open ? (
        <span className="rounded-full border border-[#22C55E]/40 bg-[#22C55E]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#86EFAC]">
          {t.checkIn.checkInOpen}
        </span>
      ) : event.checkInStatus === "closed" ? (
        <span className="rounded-full border border-white/[0.12] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#94A3B8]">
          {t.checkIn.checkInClosed}
        </span>
      ) : null}
      {showAggregate && (event.checkedInCount ?? 0) > 0 ? (
        <span className="rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2.5 py-1 text-[10px] font-medium text-[#93C5FD]">
          {(event.checkedInCount ?? 0).toLocaleString()} {t.checkIn.checkedIn}
        </span>
      ) : null}
      {userCheckedInAt ? (
        <span className="rounded-full border border-[#A855F7]/35 bg-[#A855F7]/10 px-2.5 py-1 text-[10px] font-medium text-[#E9D5FF]">
          {t.checkIn.youAreCheckedIn}{" "}
          {new Date(userCheckedInAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ) : null}
    </div>
  );
}
