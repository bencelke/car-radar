"use client";

import { BadgeCheck } from "lucide-react";
import Link from "next/link";

import { MemberAvatar } from "@/components/members/MemberAvatar";
import { MemberRoleBadge } from "@/components/members/MemberRoleBadge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { memberCarLine } from "@/lib/members/roles";
import type { Club, ClubMember } from "@/lib/types";
import { clubDetailPath } from "@/lib/utils/entity-paths";
import { formatMemberHandleLabel } from "@/lib/utils/instagram";

type MemberProfileHeaderProps = {
  member: ClubMember;
  club?: Club | null;
};

export function MemberProfileHeader({ member, club }: MemberProfileHeaderProps) {
  const { t } = useLocale();
  const location = [member.city, member.area, member.country]
    .filter(Boolean)
    .join(" · ");
  const handleLabel = formatMemberHandleLabel(member);
  const carLabel = member.carName?.trim() || memberCarLine(member);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1118]/90 p-6 backdrop-blur-xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <MemberAvatar
          member={member}
          size="lg"
          className="rounded-2xl border border-white/10 shadow-[0_0_24px_-8px_rgba(59,130,246,0.35)]"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {t.members.memberProfile}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
              {handleLabel}
            </h1>
            {member.verifiedByClub ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
                <BadgeCheck className="size-3" />
                {t.members.verifiedByClub}
              </span>
            ) : null}
          </div>
          <MemberRoleBadge role={member.role} />
          {carLabel ? (
            <p className="text-sm font-medium text-[#CBD5E1]">{carLabel}</p>
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
