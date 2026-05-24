"use client";

import { GarageProfileCard } from "@/components/members/GarageProfileCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club } from "@/lib/types";

type ClubStatsPanelProps = {
  club: Club;
  memberCount: number;
};

export function ClubStatsPanel({ club, memberCount }: ClubStatsPanelProps) {
  const { t } = useLocale();
  const count = club.memberCount ?? memberCount;

  const rows = [
    { label: t.clubs.members, value: String(count) },
    { label: t.members.location, value: club.city },
    { label: t.members.area, value: club.area },
    {
      label: t.clubs.vehicleTypes,
      value: club.vehicleTypes?.length
        ? String(club.vehicleTypes.length)
        : undefined,
    },
  ].filter((r) => r.value?.trim());

  return (
    <GarageProfileCard title={t.clubs.clubStats} compact accent="blue">
      <dl className="grid grid-cols-2 gap-2">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5">
            <dt className="text-[9px] font-semibold uppercase tracking-wider text-[#64748B]">
              {row.label}
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-[#E2E8F0]">{row.value}</dd>
          </div>
        ))}
      </dl>
      {club.ownerName ? (
        <p className="mt-2 text-[10px] text-[#64748B]">
          {club.ownerName}
          {club.contactInstagram ? ` · @${club.contactInstagram.replace(/^@/, "")}` : ""}
        </p>
      ) : null}
    </GarageProfileCard>
  );
}
