"use client";

import Link from "next/link";
import { BadgeCheck, Share2, Users } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { Club } from "@/lib/types";

type ClubCardProps = {
  club: Club;
};

export function ClubCard({ club }: ClubCardProps) {
  const { t } = useLocale();
  const href = `/clubs/${club.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl transition hover:border-[#EF4444]/30 hover:shadow-[0_0_32px_-12px_rgba(239,68,68,0.35)]">
      <div className="relative h-28 bg-gradient-to-br from-[#EF4444]/25 via-[#111827] to-[#3B82F6]/20">
        {club.verified ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
            <BadgeCheck className="size-3" />
            {t.clubs.verifiedClub}
          </span>
        ) : null}
        {club.featured ? (
          <span className="absolute left-3 top-3 rounded-full border border-[#FACC15]/40 bg-[#FACC15]/15 px-2 py-0.5 text-[10px] font-semibold text-[#FACC15]">
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-heading text-base font-bold text-[#F8FAFC]">
            {club.name}
          </h3>
          <p className="text-xs text-[#F97316]">{club.type}</p>
          <p className="mt-1 text-[11px] text-[#64748B]">
            {club.city}
            {club.area ? ` · ${club.area}` : ""}, {club.country}
          </p>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-[#94A3B8]">
          {club.description}
        </p>

        {club.tags && club.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {club.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.08] bg-[#151B24]/80 px-2 py-0.5 text-[10px] text-[#CBD5E1]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="flex items-center gap-1 text-[11px] text-[#64748B]">
            <Users className="size-3.5" />
            {club.memberCount?.toLocaleString() ?? "—"} {t.clubs.members}
          </span>
          <div className="flex gap-1.5">
            {club.instagram ? (
              <a
                href={club.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] text-[#64748B] transition hover:text-[#F8FAFC]"
                aria-label={t.clubs.instagram}
              >
                <Share2 className="size-3.5" />
              </a>
            ) : null}
            <Button
              nativeButton={false}
              render={<Link href={href} />}
              size="sm"
              className="h-8 border border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC] hover:bg-[#EF4444]/25"
            >
              {t.clubs.viewClub}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
