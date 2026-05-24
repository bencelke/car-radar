"use client";

import { BadgeCheck, Pencil, Share2 } from "lucide-react";
import Link from "next/link";

import { FollowPlaceholderButton } from "@/components/members/FollowPlaceholderButton";
import { MemberProfileCarImage } from "@/components/members/MemberProfileCarImage";
import { MemberRoleBadge } from "@/components/members/MemberRoleBadge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { memberCarLine } from "@/lib/members/roles";
import type { Club, ClubMember } from "@/lib/types";
import { clubDetailPath, correctionSubmitPath } from "@/lib/utils/entity-paths";
import {
  formatMemberHandleLabel,
  memberInstagramUrl,
} from "@/lib/utils/instagram";
import { cn } from "@/lib/utils";

const actionBtnClass =
  "inline-flex h-9 min-h-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition sm:px-3";

type MemberProfileHeroProps = {
  member: ClubMember;
  club?: Club | null;
};

export function MemberProfileHero({ member, club }: MemberProfileHeroProps) {
  const { t } = useLocale();
  const location = [member.city, member.area, member.country]
    .filter(Boolean)
    .join(" · ");
  const handleLabel = formatMemberHandleLabel(member);
  const carTitle = member.carName?.trim();
  const carLine = memberCarLine(member);
  const instagramHref = memberInstagramUrl(member);
  const correctionHref = correctionSubmitPath(
    "member",
    member.displayName,
    member.id
  );

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0B1118] via-[#0F172A]/98 to-[#151B24]/90 p-3 backdrop-blur-xl sm:p-4">
      <div className="relative mb-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">
          {t.members.garageProfile}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[8px] font-medium text-[#94A3B8]">
          {t.members.publicProfile}
        </span>
        {member.verifiedByClub ? (
          <span className="inline-flex items-center gap-0.5 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/12 px-1.5 py-0.5 text-[8px] font-semibold text-[#22C55E]">
            <BadgeCheck className="size-2.5" />
            {t.members.verifiedByClub}
          </span>
        ) : null}
      </div>

      <div className="relative grid gap-3 sm:grid-cols-[minmax(140px,220px)_minmax(0,1fr)] sm:items-start sm:gap-4">
        <MemberProfileCarImage member={member} className="sm:max-w-[220px]" />

        <div className="flex min-w-0 flex-col gap-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-xl font-bold leading-tight tracking-tight text-[#F8FAFC] sm:text-2xl">
                {handleLabel}
              </h1>
              <MemberRoleBadge role={member.role} showMember size="xs" />
            </div>

            {carTitle ? (
              <p className="font-heading text-base font-semibold leading-snug text-[#E2E8F0]">
                {carTitle}
              </p>
            ) : carLine ? (
              <p className="font-heading text-base font-semibold text-[#E2E8F0]">
                {carLine}
              </p>
            ) : null}

            {location ? (
              <p className="text-xs leading-snug text-[#94A3B8]">{location}</p>
            ) : null}

            {club ? (
              <Link
                href={clubDetailPath(club)}
                className="inline-flex max-w-full items-center rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-semibold text-[#93C5FD] transition hover:border-[#3B82F6]/50"
              >
                {club.name}
              </Link>
            ) : member.clubName ? (
              <p className="text-[10px] font-medium text-[#64748B]">
                {member.clubName}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {instagramHref ? (
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  actionBtnClass,
                  "border-white/10 bg-[#151B24]/80 text-[#F8FAFC] hover:border-[#E1306C]/40 hover:bg-[#E1306C]/10"
                )}
              >
                <Share2 className="size-3.5 shrink-0 text-[#E1306C]" />
                {t.members.openInstagram}
              </a>
            ) : null}
            <FollowPlaceholderButton className="[&_button]:h-9" />
            {club ? (
              <Link
                href={clubDetailPath(club)}
                className={cn(
                  actionBtnClass,
                  "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#93C5FD] hover:bg-[#3B82F6]/20"
                )}
              >
                {t.members.viewClub}
              </Link>
            ) : null}
            <Link
              href={correctionHref}
              className={cn(
                actionBtnClass,
                "border-white/10 bg-[#151B24]/50 text-[#94A3B8] hover:border-white/20 hover:text-[#F8FAFC]"
              )}
            >
              <Pencil className="size-3.5 shrink-0" />
              {t.members.submitCorrection}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
