"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, Share2, Users } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { clubCoverUrl } from "@/lib/clubs/club-image-path";
import { Button } from "@/components/ui/button";
import type { Club } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClubCardProps = {
  club: Club;
};

export function ClubCard({ club }: ClubCardProps) {
  const { t } = useLocale();
  const href = `/clubs/${club.slug}`;
  const coverSrc = clubCoverUrl(club);
  const [coverFailed, setCoverFailed] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const showCover = Boolean(coverSrc && !coverFailed);

  useEffect(() => {
    setCoverFailed(false);
    setCoverLoaded(false);
  }, [coverSrc]);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl transition hover:border-[#EF4444]/30 hover:shadow-[0_0_32px_-12px_rgba(239,68,68,0.35)]">
      <div className="relative h-32 overflow-hidden bg-gradient-to-br from-[#EF4444]/30 via-[#1E1B4B] to-[#3B82F6]/25 sm:h-36">
        {!showCover || !coverLoaded ? (
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#111827]"
            aria-hidden={showCover && coverLoaded}
          >
            <span className="font-heading text-3xl font-bold text-white/15">
              {club.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        ) : null}
        {showCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={coverSrc}
            src={coverSrc}
            alt=""
            decoding="async"
            className={cn(
              "absolute inset-0 size-full object-cover transition-opacity duration-300 group-hover:scale-[1.02]",
              coverLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setCoverLoaded(true)}
            onError={() => setCoverFailed(true)}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1118] via-transparent to-transparent" />
        {club.verified ? (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full border border-[#22C55E]/40 bg-[#0B1118]/80 px-2 py-0.5 text-[9px] font-semibold text-[#22C55E] backdrop-blur-sm">
            <BadgeCheck className="size-3" />
            {t.clubs.verifiedClub}
          </span>
        ) : null}
        {club.featured ? (
          <span className="absolute left-2 top-2 rounded-full border border-[#FACC15]/40 bg-[#0B1118]/80 px-2 py-0.5 text-[9px] font-semibold text-[#FDE047] backdrop-blur-sm">
            Featured
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">
        <div>
          <h3 className="font-heading text-base font-bold text-[#F8FAFC] group-hover:text-white">
            {club.name}
          </h3>
          <p className="text-[10px] text-[#F97316]">{club.type}</p>
          <p className="mt-0.5 text-[10px] text-[#64748B]">
            {club.city}
            {club.area ? ` · ${club.area}` : ""}, {club.country}
          </p>
        </div>

        {club.shortDescription ? (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-[#94A3B8]">
            {club.shortDescription}
          </p>
        ) : (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-[#94A3B8]">
            {club.description}
          </p>
        )}

        {(club.vehicleTypes?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-1">
            {club.vehicleTypes!.slice(0, 4).map((v) => (
              <span
                key={v}
                className="rounded-full border border-white/[0.08] bg-[#151B24]/80 px-1.5 py-0.5 text-[8px] text-[#CBD5E1]"
              >
                {v}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="flex items-center gap-1 text-[10px] text-[#64748B]">
            <Users className="size-3" />
            {club.memberCount?.toLocaleString() ?? "—"} {t.clubs.members}
          </span>
          <div className="flex gap-1.5">
            {club.instagram ? (
              <a
                href={club.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-7 items-center justify-center rounded-lg border border-white/[0.08] text-[#64748B] transition hover:text-[#F8FAFC]"
                aria-label={t.clubs.instagram}
              >
                <Share2 className="size-3" />
              </a>
            ) : null}
            <Button
              nativeButton={false}
              render={<Link href={href} />}
              size="sm"
              className="h-7 border border-[#EF4444]/40 bg-[#EF4444]/15 text-[10px] text-[#F8FAFC] hover:bg-[#EF4444]/25"
            >
              {t.clubs.viewClub}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
