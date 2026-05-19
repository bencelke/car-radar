"use client";

import { BadgeCheck } from "lucide-react";

import { MemberAvatar } from "@/components/members/MemberAvatar";
import { MemberRoleBadge } from "@/components/members/MemberRoleBadge";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club, ClubMember } from "@/lib/types";
import { memberCarLine } from "@/lib/members/roles";
import { clubDetailPath } from "@/lib/utils/entity-paths";
import Link from "next/link";

type MemberProfileHeaderProps = {
  member: ClubMember;
  club?: Club | null;
};

export function MemberProfileHeader({ member, club }: MemberProfileHeaderProps) {
  const { t } = useLocale();
  const location = [member.city, member.area, member.country]
    .filter(Boolean)
    .join(" · ");
  const car = memberCarLine(member);

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/90 backdrop-blur-xl">
      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-end">
        <MemberAvatar member={member} size="lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {t.members.memberProfile}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
              {member.displayName}
            </h1>
            {member.nickname ? (
              <span className="text-sm text-[#64748B]">({member.nickname})</span>
            ) : null}
            {member.verifiedByClub ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
                <BadgeCheck className="size-3" />
                {t.members.verifiedByClub}
              </span>
            ) : null}
          </div>
          <MemberRoleBadge role={member.role} />
          {car ? (
            <p className="text-sm font-medium text-[#CBD5E1]">{car}</p>
          ) : null}
          {location ? (
            <p className="text-xs text-[#64748B]">
              {t.members.location}: {location}
            </p>
          ) : null}
          {club ? (
            <Link
              href={clubDetailPath(club)}
              className="inline-block text-xs font-medium text-[#3B82F6] hover:underline"
            >
              {t.members.clubAffiliation}: {club.name}
            </Link>
          ) : member.clubName ? (
            <p className="text-xs text-[#64748B]">
              {t.members.clubAffiliation}: {member.clubName}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
