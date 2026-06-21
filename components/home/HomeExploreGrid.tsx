"use client";

import Link from "next/link";
import { ExternalLink, MapPin, Share2, Star, Users } from "lucide-react";

import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useLocale } from "@/components/providers/LocaleProvider";
import { clubCoverUrl } from "@/lib/clubs/club-image-path";
import { accentStyles } from "@/lib/config/accents";
import { eventToEventItem, shopToShopItem } from "@/lib/mappers/ui";
import type { CarEvent, CarShop, Club } from "@/lib/types";
import {
  clubDetailPath,
  eventDetailPath,
  shopDetailPath,
} from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type HomeExploreGridProps = {
  events: CarEvent[];
  clubs: Club[];
  shops: CarShop[];
};

function CompactEventCard({ event }: { event: CarEvent }) {
  const { t } = useLocale();
  const item = eventToEventItem(event);
  const accent = accentStyles[item.accent];

  return (
    <Link
      href={eventDetailPath(event)}
      className="group flex gap-3 rounded-xl border border-white/[0.06] bg-[#0B1118]/70 p-3 transition hover:border-orange-500/25 hover:bg-[#151B24]/80"
    >
      <div
        className={cn(
          "flex size-14 shrink-0 flex-col items-center justify-center rounded-lg bg-gradient-to-br text-center",
          item.gradient
        )}
      >
        <span className="text-[9px] font-bold uppercase text-white/90">
          {item.date.split(" ").slice(-2).join(" ")}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-sm text-[#F8FAFC] group-hover:text-white">
          {event.title}
        </h4>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#64748B]">
          <MapPin className="size-3 shrink-0" />
          {event.city}
        </p>
        {event.clubName ? (
          <p className="truncate text-[10px] text-[#64748B]">{event.clubName}</p>
        ) : null}
        {event.interestedCount != null && event.interestedCount > 0 ? (
          <p className={cn("mt-1 text-[10px] font-medium", accent.text)}>
            {event.interestedCount} {t.home.interested}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function CompactClubCard({ club }: { club: Club }) {
  const { t } = useLocale();
  const cover = clubCoverUrl(club);

  return (
    <Link
      href={clubDetailPath(club)}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0B1118]/70 p-3 transition hover:border-blue-500/25 hover:bg-[#151B24]/80"
    >
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-600/40 to-indigo-900/40">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center font-heading text-sm font-bold text-white/30">
            {club.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-[#F8FAFC]">{club.name}</h4>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#64748B]">
          <MapPin className="size-3 shrink-0" />
          {club.city}
          {club.area ? ` · ${club.area}` : ""}
        </p>
        {club.memberCount != null && club.memberCount > 0 ? (
          <p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#94A3B8]">
            <Users className="size-3" />
            {club.memberCount.toLocaleString()} {t.home.membersLabel}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function CompactShopCard({ shop }: { shop: CarShop }) {
  const item = shopToShopItem(shop);

  return (
    <Link
      href={shopDetailPath(shop)}
      className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0B1118]/70 p-3 transition hover:border-amber-500/25 hover:bg-[#151B24]/80"
    >
      <div
        className={cn(
          "size-12 shrink-0 rounded-lg bg-gradient-to-br",
          item.gradient
        )}
      />
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-medium text-[#F8FAFC]">{shop.name}</h4>
        <p className="mt-0.5 text-[11px] text-[#64748B]">
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px]">
            {item.category}
          </span>
          <span className="mx-1">·</span>
          {shop.city}
        </p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-[#64748B]">
          {shop.rating != null && shop.rating > 0 ? (
            <span className="flex items-center gap-0.5 text-amber-400">
              <Star className="size-3 fill-current" />
              {shop.rating.toFixed(1)}
            </span>
          ) : null}
          {shop.instagram ? (
            <span className="flex items-center gap-0.5">
              <Share2 className="size-3" />
              IG
            </span>
          ) : null}
          {shop.website ? (
            <span className="flex items-center gap-0.5">
              <ExternalLink className="size-3" />
              Web
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function HomeExploreGrid({ events, clubs, shops }: HomeExploreGridProps) {
  const { t } = useLocale();

  const upcoming = events
    .filter((e) => new Date(e.startTime).getTime() >= Date.now())
    .slice(0, 4);
  const featuredClubs = clubs.slice(0, 4);
  const nearbyShops = shops.slice(0, 6);

  return (
    <div className="space-y-10">
      <section>
        <HomeSectionHeader
          title={t.home.eventsSection}
          href="/events"
          actionLabel={t.home.viewAllEvents}
        />
        {upcoming.length === 0 ? (
          <p className="text-sm text-[#64748B]">{t.home.noUpcomingEvents}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((event) => (
              <CompactEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      <section>
        <HomeSectionHeader
          title={t.home.featuredCommunities}
          href="/clubs"
          actionLabel={t.home.viewAllClubs}
        />
        {featuredClubs.length === 0 ? (
          <p className="text-sm text-[#64748B]">{t.home.noClubsYet}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featuredClubs.map((club) => (
              <CompactClubCard key={club.id} club={club} />
            ))}
          </div>
        )}
      </section>

      <section>
        <HomeSectionHeader
          title={t.home.shopsNearYou}
          href="/shops"
          actionLabel={t.home.viewAllShops}
        />
        {nearbyShops.length === 0 ? (
          <p className="text-sm text-[#64748B]">{t.home.noShopsYet}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nearbyShops.map((shop) => (
              <CompactShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
