"use client";

import Link from "next/link";
import { BadgeCheck, ExternalLink, Share2 } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { Club } from "@/lib/types";

type ClubDetailHeaderProps = {
  club: Club;
};

function SocialButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#151B24]/80 px-3 py-1.5 text-xs font-medium text-[#CBD5E1] transition hover:border-white/[0.12] hover:text-[#F8FAFC]"
    >
      <Share2 className="size-3.5" />
      {label}
    </a>
  );
}

export function ClubDetailHeader({ club }: ClubDetailHeaderProps) {
  const { t } = useLocale();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl">
      <div className="h-36 bg-gradient-to-br from-[#EF4444]/30 via-[#111827] to-[#A855F7]/20" />
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-bold text-[#F8FAFC] sm:text-3xl">
                {club.name}
              </h1>
              {club.verified ? (
                <span className="flex items-center gap-1 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
                  <BadgeCheck className="size-3" />
                  {t.clubs.verifiedClub}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-[#F97316]">{club.type}</p>
            <p className="mt-1 text-sm text-[#64748B]">
              {club.city}
              {club.area ? ` · ${club.area}` : ""}, {club.country}
            </p>
          </div>
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/clubs" />}
            className="border-white/[0.08] bg-[#151B24]/60 text-[#CBD5E1]"
          >
            {t.clubs.backToClubs}
          </Button>
        </div>

        <p className="max-w-3xl text-sm leading-relaxed text-[#94A3B8]">
          {club.description}
        </p>

        {club.tags && club.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {club.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.08] bg-[#151B24]/80 px-2.5 py-0.5 text-[10px] text-[#CBD5E1]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {club.instagram ? (
            <SocialButton href={club.instagram} label={t.clubs.instagram} />
          ) : null}
          {club.tiktok ? (
            <SocialButton href={club.tiktok} label="TikTok" />
          ) : null}
          {club.youtube ? (
            <SocialButton href={club.youtube} label="YouTube" />
          ) : null}
          {club.website ? (
            <a
              href={club.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#151B24]/80 px-3 py-1.5 text-xs font-medium text-[#CBD5E1] hover:text-[#F8FAFC]"
            >
              <ExternalLink className="size-3.5" />
              {t.common.website}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
