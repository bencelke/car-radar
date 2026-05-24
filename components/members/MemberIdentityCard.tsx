"use client";

import Link from "next/link";

import { MemberBuildTags } from "@/components/members/MemberBuildTags";
import { GarageProfileCard } from "@/components/members/GarageProfileCard";
import { MemberProfileCompleteness } from "@/components/members/MemberProfileCompleteness";
import { MemberRoleBadge } from "@/components/members/MemberRoleBadge";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club, ClubMember } from "@/lib/types";
import { clubDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type MemberIdentityCardProps = {
  member: ClubMember;
  club?: Club | null;
  className?: string;
};

function isGenericBuildSummary(text: string): boolean {
  return /member car profile/i.test(text.trim());
}

export function MemberIdentityCard({
  member,
  club,
  className,
}: MemberIdentityCardProps) {
  const { t } = useLocale();
  const summary = member.buildSummary?.trim();
  const hasTags = (member.buildTags?.length ?? 0) > 0;
  const hasContent =
    Boolean(summary) || hasTags || Boolean(member.role) || Boolean(club ?? member.clubName);

  if (!hasContent) return null;

  return (
    <GarageProfileCard title={t.members.carIdentity} compact className={className}>
      <div className="space-y-3">
        <MemberProfileCompleteness member={member} club={club} />

        <div className="flex flex-wrap items-center gap-2">
          <MemberRoleBadge role={member.role} showMember size="xs" />
          {club ? (
            <Link
              href={clubDetailPath(club)}
              className="rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-semibold text-[#93C5FD] hover:bg-[#3B82F6]/20"
            >
              {club.name}
            </Link>
          ) : member.clubName ? (
            <span className="text-[10px] font-medium text-[#64748B]">
              {member.clubName}
            </span>
          ) : null}
        </div>

        {summary ? (
          <p
            className={cn(
              "text-sm leading-relaxed",
              isGenericBuildSummary(summary)
                ? "text-[#64748B] italic"
                : "text-[#CBD5E1]"
            )}
          >
            {summary}
          </p>
        ) : null}

        {hasTags ? <MemberBuildTags tags={member.buildTags!} /> : null}
      </div>
    </GarageProfileCard>
  );
}
