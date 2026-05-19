"use client";

import Link from "next/link";
import { BadgeCheck, Share2 } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { Club, ClubMember } from "@/lib/types";
import { memberDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type MemberCardProps = {
  member: ClubMember;
  club?: Club | null;
};

function carLabel(member: ClubMember): string {
  const parts = [member.carYear, member.carMake, member.carModel].filter(Boolean);
  return parts.join(" ") || member.carName || "Build";
}

export function MemberCard({ member, club }: MemberCardProps) {
  const { t } = useLocale();
  const href = memberDetailPath(member);
  const accent =
    member.carMake?.toLowerCase().includes("bmw") ? "from-blue-600/40" : "from-red-600/40";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl transition hover:border-white/[0.12]">
      <div
        className={cn(
          "relative h-24 bg-gradient-to-br to-[#05070A]",
          accent
        )}
      >
        {member.verifiedByClub ? (
          <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#22C55E]">
            <BadgeCheck className="size-2.5" />
            {t.members.verifiedByClub}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <h4 className="font-heading text-sm font-semibold text-[#F8FAFC]">
            {member.displayName}
            {member.nickname ? (
              <span className="ml-1 text-[10px] font-normal text-[#64748B]">
                ({member.nickname})
              </span>
            ) : null}
          </h4>
          <p className="text-[11px] font-medium text-[#CBD5E1]">{carLabel(member)}</p>
          {member.buildSummary ? (
            <p className="mt-1 text-[10px] leading-relaxed text-[#64748B]">
              {member.buildSummary}
            </p>
          ) : null}
        </div>

        {member.buildTags && member.buildTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {member.buildTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-1.5 py-0.5 text-[9px] text-[#F8FAFC]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {club ? (
            <Link
              href={`/clubs/${club.slug}`}
              className="truncate text-[10px] text-[#3B82F6] hover:underline"
            >
              {club.name}
            </Link>
          ) : (
            <span className="text-[10px] text-[#64748B]">
              {member.city}
              {member.area ? ` · ${member.area}` : ""}
            </span>
          )}
          <div className="flex gap-1">
            {member.instagram ? (
              <a
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-7 items-center justify-center rounded-lg border border-white/[0.08] text-[#64748B] hover:text-[#F8FAFC]"
                aria-label={t.members.viewInstagram}
              >
                <Share2 className="size-3" />
              </a>
            ) : null}
            <Button
              nativeButton={false}
              render={<Link href={href} />}
              size="sm"
              className="h-7 px-2 text-[10px] border border-white/[0.08] bg-[#151B24]/80"
            >
              {t.detail.viewDetails}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
