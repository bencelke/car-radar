"use client";

import { BadgeCheck, MapPin, Pencil, Share2 } from "lucide-react";
import Link from "next/link";

import { ClubProfileImage } from "@/components/clubs/ClubProfileImage";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club } from "@/lib/types";
import { correctionSubmitPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

const btnClass =
  "inline-flex h-9 min-h-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition sm:px-3";

type ClubProfileHeroProps = {
  club: Club;
  memberCount: number;
  /** Cache-busted cover for immediate update after local save */
  coverSrc?: string;
};

export function ClubProfileHero({ club, memberCount, coverSrc }: ClubProfileHeroProps) {
  const { t } = useLocale();
  const location = [club.city, club.area, club.country].filter(Boolean).join(" · ");
  const count = club.memberCount ?? memberCount;
  const correctionHref = correctionSubmitPath("club", club.name, club.id);
  const mapHref =
    club.lat != null && club.lng != null
      ? `/map?lat=${club.lat}&lng=${club.lng}&zoom=12`
      : "/map";
  const blurb = club.shortDescription?.trim() || club.description?.trim();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0B1118] via-[#0F172A]/98 to-[#151B24]/90 p-3 shadow-[0_0_32px_-12px_rgba(239,68,68,0.2)] backdrop-blur-xl sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] sm:items-start sm:gap-4">
        <ClubProfileImage club={club} coverSrc={coverSrc} />

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#F97316]/40 bg-[#F97316]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FDBA74]">
              {club.type}
            </span>
            {club.category ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-[#94A3B8]">
                {club.category.replace(/_/g, " ")}
              </span>
            ) : null}
            {club.verified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/12 px-2 py-0.5 text-[10px] font-semibold text-[#86EFAC]">
                <BadgeCheck className="size-3" />
                {t.clubs.verifiedClub}
              </span>
            ) : null}
            {club.featured ? (
              <span className="rounded-full border border-[#FACC15]/40 bg-[#FACC15]/15 px-2 py-0.5 text-[10px] font-semibold text-[#FDE047]">
                Featured
              </span>
            ) : null}
            <Link
              href="/clubs"
              className="ml-auto text-[10px] font-medium text-[#93C5FD] hover:underline sm:hidden"
            >
              {t.clubs.backToClubs}
            </Link>
          </div>

          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
              {club.name}
            </h1>
            {location ? (
              <p className="text-xs text-[#94A3B8] sm:text-sm">{location}</p>
            ) : null}
            <p className="text-[11px] font-medium text-[#64748B]">
              {count} {t.clubs.members}
            </p>
            {blurb ? (
              <p className="line-clamp-3 text-xs leading-relaxed text-[#CBD5E1] sm:text-sm">
                {blurb}
              </p>
            ) : null}
          </div>

          {(club.vehicleTypes?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {club.vehicleTypes!.map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-white/[0.08] bg-[#151B24]/80 px-2 py-0.5 text-[10px] font-medium text-[#CBD5E1]"
                >
                  {v}
                </span>
              ))}
            </div>
          ) : null}

          {(club.primaryBrands?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {club.primaryBrands!.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-[#3B82F6]/35 bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] font-medium text-[#BFDBFE]"
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/submit?type=member&club=${encodeURIComponent(club.name)}`}
              className={cn(
                btnClass,
                "border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC] hover:bg-[#EF4444]/30"
              )}
            >
              {t.clubs.submitMember}
            </Link>
            <Link
              href={mapHref}
              className={cn(
                btnClass,
                "border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#BFDBFE] hover:bg-[#3B82F6]/25"
              )}
            >
              <MapPin className="size-3.5" />
              {t.clubs.viewOnMap}
            </Link>
            {club.instagram ? (
              <a
                href={club.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  btnClass,
                  "border-white/10 bg-white/5 text-[#F8FAFC] hover:border-[#E1306C]/50 hover:bg-[#E1306C]/10"
                )}
              >
                <Share2 className="size-3.5 text-[#E1306C]" />
                {t.clubs.openInstagram}
              </a>
            ) : null}
            <Link
              href={correctionHref}
              className={cn(
                btnClass,
                "border-white/10 bg-white/5 text-[#CBD5E1] hover:text-[#F8FAFC]"
              )}
            >
              <Pencil className="size-3.5" />
              {t.members.submitCorrection}
            </Link>
          </div>
        </div>
      </div>

      <Link
        href="/clubs"
        className="absolute right-3 top-3 hidden text-[10px] font-medium text-[#93C5FD] hover:underline sm:inline"
      >
        {t.clubs.backToClubs}
      </Link>
    </section>
  );
}
