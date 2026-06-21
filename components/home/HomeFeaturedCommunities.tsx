"use client";

import Link from "next/link";
import { MapPin, Users } from "lucide-react";

import { HomeEmptyPanel } from "@/components/home/HomeEmptyPanel";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useLocale } from "@/components/providers/LocaleProvider";
import { clubCoverUrl } from "@/lib/clubs/club-image-path";
import type { Club } from "@/lib/types";
import { clubDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type HomeFeaturedCommunitiesProps = {
  clubs: Club[];
};

function ClubDiscoveryCard({ club }: { club: Club }) {
  const { t } = useLocale();
  const cover = clubCoverUrl(club);

  return (
    <Link
      href={clubDetailPath(club)}
      className="group flex min-h-[88px] items-start gap-3 rounded-xl border border-white/[0.06] bg-[#0B1118]/70 p-3 transition hover:border-blue-500/25 hover:bg-[#151B24]/80 active:scale-[0.99]"
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-600/40 to-indigo-900/40">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <span className="flex size-full items-center justify-center font-heading text-sm font-bold text-white/30">
            {club.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-[#F8FAFC]">{club.name}</h4>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#64748B]">
          <MapPin className="size-3 shrink-0" />
          {club.city}
          {club.area ? ` · ${club.area}` : ""}
        </p>
        {club.description ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#94A3B8]">
            {club.description}
          </p>
        ) : null}
        {club.memberCount != null && club.memberCount > 0 ? (
          <p className="mt-1 flex items-center gap-1 text-[10px] text-[#64748B]">
            <Users className="size-3" />
            {club.memberCount.toLocaleString()} {t.home.membersLabel}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

export function HomeFeaturedCommunities({ clubs }: HomeFeaturedCommunitiesProps) {
  const { t } = useLocale();
  const featured = clubs.slice(0, 4);

  return (
    <section>
      <HomeSectionHeader
        title={t.home.featuredCommunities}
        href="/clubs"
        actionLabel={t.home.viewClubs}
      />

      {featured.length === 0 ? (
        <HomeEmptyPanel
          message={t.home.noClubsMapped}
          actionLabel={t.home.ctaAddClub}
          actionHref="/submit?type=club"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((club) => (
            <ClubDiscoveryCard key={club.id} club={club} />
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#151B24]/80 to-[#0B1118]/60 p-4 sm:p-5">
        <h3 className="font-heading text-base font-semibold text-[#F8FAFC] sm:text-lg">
          {t.home.clubConversionTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
          {t.home.clubConversionBody}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/submit?type=club"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[#3B82F6]/15 px-4 text-sm font-semibold text-[#BFDBFE] ring-1 ring-[#3B82F6]/30 transition hover:bg-[#3B82F6]/25"
          >
            {t.home.ctaAddClub}
          </Link>
          <Link
            href="/clubs"
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/[0.1] px-4 text-sm font-medium text-[#CBD5E1] transition hover:border-white/[0.16]"
          >
            {t.home.viewClubs}
          </Link>
        </div>
      </div>
    </section>
  );
}
