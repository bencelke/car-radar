"use client";

import Link from "next/link";
import { BadgeCheck, Share2 } from "lucide-react";

import { MemberAvatar } from "@/components/members/MemberAvatar";
import { MemberRoleBadge } from "@/components/members/MemberRoleBadge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { memberCarLine } from "@/lib/members/roles";
import type { Club, ClubMember } from "@/lib/types";
import { clubDetailPath, memberDetailPath } from "@/lib/utils/entity-paths";
import { normalizeSocialUrl } from "@/lib/utils/social";

type MemberCardProps = {
  member: ClubMember;
  club?: Club | null;
};

export function MemberCard({ member, club }: MemberCardProps) {
  const { t } = useLocale();
  const profileHref = memberDetailPath(member);
  const car = memberCarLine(member);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl transition hover:border-[#3B82F6]/35 hover:shadow-[0_0_24px_-8px_rgba(59,130,246,0.4)]">
      <div className="relative flex items-start gap-3 p-3">
        <MemberAvatar member={member} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="font-heading text-sm font-semibold text-[#F8FAFC] group-hover:text-white">
              {member.displayName}
            </h4>
            {member.verifiedByClub ? (
              <BadgeCheck
                className="size-3.5 text-[#22C55E]"
                aria-label={t.members.verifiedByClub}
              />
            ) : null}
          </div>
          {member.nickname ? (
            <p className="text-[10px] text-[#64748B]">{member.nickname}</p>
          ) : null}
          <MemberRoleBadge role={member.role} size="xs" className="mt-1" />
          <p className="mt-1 text-[11px] font-medium text-[#CBD5E1]">{car}</p>
        </div>
        {member.instagram ? (
          <a
            href={normalizeSocialUrl(member.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] text-[#64748B] hover:text-[#F8FAFC]"
            aria-label={t.members.instagram}
          >
            <Share2 className="size-3.5" />
          </a>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3 pb-3">
        {member.buildSummary ? (
          <p className="line-clamp-2 text-[10px] leading-relaxed text-[#64748B]">
            {member.buildSummary}
          </p>
        ) : null}
        {member.buildTags && member.buildTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {member.buildTags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-1.5 py-0.5 text-[9px] text-[#F8FAFC]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        {club ? (
          <Link
            href={clubDetailPath(club)}
            className="truncate text-[10px] text-[#3B82F6] hover:underline"
          >
            {club.name}
          </Link>
        ) : member.clubName ? (
          <p className="truncate text-[10px] text-[#64748B]">{member.clubName}</p>
        ) : (
          <p className="truncate text-[10px] text-[#64748B]">{member.city}</p>
        )}
        <div className="mt-auto flex items-center justify-end gap-1.5 pt-1">
          <Button
            nativeButton={false}
            render={<Link href={profileHref} />}
            size="sm"
            className="h-8 border border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#F8FAFC] hover:bg-[#3B82F6]/25"
          >
            {t.members.viewProfile}
          </Button>
        </div>
      </div>
    </article>
  );
}
