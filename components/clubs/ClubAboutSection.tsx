"use client";

import { GarageProfileCard } from "@/components/members/GarageProfileCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club } from "@/lib/types";

type ClubAboutSectionProps = {
  club: Club;
};

export function ClubAboutSection({ club }: ClubAboutSectionProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-3">
      <GarageProfileCard title={t.clubs.aboutClub} compact>
        <p className="text-sm leading-relaxed text-[#94A3B8]">{club.description}</p>
        {club.tags && club.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {club.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.08] bg-[#151B24]/80 px-2 py-0.5 text-[9px] text-[#CBD5E1]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </GarageProfileCard>

      {club.joinRequirements ? (
        <GarageProfileCard title={t.clubs.joinRequirements} compact>
          <p className="text-xs leading-relaxed text-[#94A3B8]">
            {club.joinRequirements}
          </p>
        </GarageProfileCard>
      ) : null}

      {club.meetingStyle ? (
        <GarageProfileCard title={t.clubs.meetingStyle} compact>
          <p className="text-xs leading-relaxed text-[#94A3B8]">{club.meetingStyle}</p>
        </GarageProfileCard>
      ) : null}
    </div>
  );
}
