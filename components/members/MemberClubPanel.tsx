"use client";

import Link from "next/link";

import { GarageProfileCard } from "@/components/members/GarageProfileCard";
import { MemberRoleBadge } from "@/components/members/MemberRoleBadge";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club, ClubMember } from "@/lib/types";
import { clubDetailPath } from "@/lib/utils/entity-paths";

type MemberClubPanelProps = {
  member: ClubMember;
  club: Club;
};

export function MemberClubPanel({ member, club }: MemberClubPanelProps) {
  const { t } = useLocale();
  const sceneLine = [member.city, member.area].filter(Boolean).join(" · ");

  return (
    <GarageProfileCard title={t.members.clubAffiliation} accent="blue" compact>
      <div className="space-y-2">
        <div>
          <p className="font-heading text-sm font-bold text-[#F8FAFC]">{club.name}</p>
          <p className="mt-0.5 text-[10px] text-[#94A3B8]">
            {[club.type, club.category].filter(Boolean).join(" · ")}
          </p>
          {sceneLine ? (
            <p className="mt-1 text-[10px] leading-snug text-[#64748B]">{sceneLine}</p>
          ) : null}
        </div>
        <MemberRoleBadge role={member.role} showMember size="xs" />
        <Link
          href={clubDetailPath(club)}
          className="flex h-8 w-full items-center justify-center rounded-lg border border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[11px] font-medium text-[#F8FAFC] transition hover:bg-[#3B82F6]/25"
        >
          {t.members.viewClub}
        </Link>
      </div>
    </GarageProfileCard>
  );
}
