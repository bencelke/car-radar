"use client";

import { GarageProfileCard } from "@/components/members/GarageProfileCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { ClubMember } from "@/lib/types";

type MemberLocationPanelProps = {
  member: ClubMember;
};

export function MemberLocationPanel({ member }: MemberLocationPanelProps) {
  const { t } = useLocale();
  const cells = [
    { label: t.submit.country, value: member.country },
    { label: t.members.location, value: member.city },
    { label: t.members.area, value: member.area },
  ].filter((c) => c.value?.trim());

  if (cells.length === 0) return null;

  return (
    <GarageProfileCard title={t.members.location} compact>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2 py-1.5"
          >
            <dt className="text-[9px] font-semibold uppercase tracking-wider text-[#64748B]">
              {cell.label}
            </dt>
            <dd className="mt-0.5 text-xs font-medium leading-snug text-[#E2E8F0]">
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>
    </GarageProfileCard>
  );
}
