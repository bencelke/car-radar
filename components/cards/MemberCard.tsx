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
import {
  formatMemberHandleLabel,
  memberInstagramUrl,
} from "@/lib/utils/instagram";

type MemberCardProps = {
  member: ClubMember;
  club?: Club | null;
};

export function MemberCard({ member, club }: MemberCardProps) {
  const { t } = useLocale();
  const profileHref = memberDetailPath(member);
  const handleLabel = formatMemberHandleLabel(member);
  const carLabel = member.carName?.trim() || memberCarLine(member);
  const instagramHref = memberInstagramUrl(member);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#0B1118]/95 to-[#151B24]/80 backdrop-blur-xl transition hover:border-[#3B82F6]/35 hover:shadow-[0_0_20px_-8px_rgba(59,130,246,0.35)]">
      <div className="flex gap-2.5 p-2.5">
        <MemberAvatar
          member={member}
          size="md"
          className="size-14 shrink-0 rounded-xl border border-white/10 sm:size-16"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1">
                <h4 className="truncate font-heading text-sm font-semibold text-[#F8FAFC] group-hover:text-white">
                  {handleLabel}
                </h4>
                {member.verifiedByClub ? (
                  <BadgeCheck
                    className="size-3 shrink-0 text-[#22C55E]"
                    aria-label={t.members.verifiedByClub}
                  />
                ) : null}
              </div>
              {carLabel ? (
                <p className="mt-0.5 truncate text-[10px] font-medium text-[#CBD5E1]">
                  {carLabel}
                </p>
              ) : null}
              <MemberRoleBadge role={member.role} size="xs" className="mt-1" />
            </div>
            {instagramHref ? (
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#151B24]/80 text-[#CBD5E1] hover:text-[#F8FAFC]"
                aria-label={t.members.instagram}
              >
                <Share2 className="size-3" />
              </a>
            ) : null}
          </div>
          {club ? (
            <Link
              href={clubDetailPath(club)}
              className="mt-1 inline-block truncate text-[9px] text-[#3B82F6] hover:underline"
            >
              {club.name}
            </Link>
          ) : member.clubName ? (
            <p className="mt-1 truncate text-[9px] text-[#64748B]">{member.clubName}</p>
          ) : (
            <p className="mt-1 truncate text-[9px] text-[#64748B]">{member.city}</p>
          )}
        </div>
      </div>

      {(member.buildSummary || (member.buildTags?.length ?? 0) > 0) && (
        <div className="space-y-1.5 border-t border-white/[0.06] px-2.5 py-2">
          {member.buildSummary ? (
            <p className="line-clamp-2 text-[9px] leading-relaxed text-[#64748B]">
              {member.buildSummary}
            </p>
          ) : null}
          {member.buildTags && member.buildTags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {member.buildTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#EF4444]/25 bg-[#EF4444]/8 px-1.5 py-0.5 text-[8px] text-[#F8FAFC]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div className="mt-auto border-t border-white/[0.06] px-2.5 py-2">
        <Button
          nativeButton={false}
          render={<Link href={profileHref} />}
          size="sm"
          className="h-7 w-full border border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[11px] text-[#F8FAFC] hover:bg-[#3B82F6]/25"
        >
          {t.members.viewProfile}
        </Button>
      </div>
    </article>
  );
}
