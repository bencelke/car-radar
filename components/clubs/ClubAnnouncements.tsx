"use client";

import { ClubAnnouncementCard } from "@/components/clubs/ClubAnnouncementCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { ClubAnnouncement } from "@/lib/types";

type ClubAnnouncementsProps = {
  announcements: ClubAnnouncement[];
};

export function ClubAnnouncements({ announcements }: ClubAnnouncementsProps) {
  const { t } = useLocale();

  return (
    <section className="rounded-xl border border-white/[0.08] bg-[#0B1118]/50 p-3 sm:p-4">
      <h2 className="font-heading text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">
        {t.community.announcements}
      </h2>
      {announcements.length === 0 ? (
        <p className="mt-3 text-sm text-[#64748B]">
          {t.community.noAnnouncements}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {announcements.map((a) => (
            <li key={a.id}>
              <ClubAnnouncementCard
                announcement={a}
                eventHref={
                  a.relatedEventId
                    ? `/events/${a.relatedEventId}`
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
