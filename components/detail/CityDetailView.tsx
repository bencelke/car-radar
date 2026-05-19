"use client";

import Link from "next/link";

import { MapPreviewCard } from "@/components/detail/MapPreviewCard";
import { RelatedEntityList } from "@/components/detail/RelatedEntityList";
import { RelatedSection } from "@/components/detail/RelatedSection";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { CityPageData } from "@/lib/data/city-page";
import { categoryToLabel } from "@/lib/mappers/ui";
import {
  clubDetailPath,
  eventDetailPath,
  memberDetailPath,
  shopDetailPath,
} from "@/lib/utils/entity-paths";

type CityDetailViewProps = {
  data: CityPageData;
};

export function CityDetailView({ data }: CityDetailViewProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl">
          {t.detail.carSceneIn} {data.cityName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#64748B]">
          {t.detail.citySubtitle}
        </p>
      </div>

      <MapPreviewCard
        city={data.cityName}
        mapHref="/map"
        openMapLabel={t.map.openFullMap}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RelatedSection title={t.nav.shops}>
          <RelatedEntityList
            items={data.shops.map((shop) => ({
              href: shopDetailPath(shop),
              title: shop.name,
              subtitle: categoryToLabel(shop.category),
            }))}
          />
        </RelatedSection>
        <RelatedSection title={t.nav.clubs}>
          <RelatedEntityList
            items={data.clubs.map((club) => ({
              href: clubDetailPath(club),
              title: club.name,
              subtitle: club.type,
            }))}
          />
        </RelatedSection>
        <RelatedSection title={t.nav.events}>
          <RelatedEntityList
            items={data.events.map((event) => ({
              href: eventDetailPath(event),
              title: event.title,
              subtitle: event.type,
            }))}
          />
        </RelatedSection>
        <RelatedSection title={t.detail.memberCars}>
          <RelatedEntityList
            items={data.members.map((member) => ({
              href: memberDetailPath(member),
              title: member.displayName,
              subtitle: [member.carMake, member.carModel].filter(Boolean).join(" "),
            }))}
          />
        </RelatedSection>
      </div>

      {data.zones.length > 0 ? (
        <RelatedSection title={t.map.filterZones}>
          <RelatedEntityList
            items={data.zones.map((zone) => ({
              href: `/map`,
              title: zone.name,
              subtitle: zone.type,
            }))}
          />
        </RelatedSection>
      ) : null}

      <Link
        href="/submit"
        className="inline-flex rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/15 px-4 py-2.5 text-sm font-medium text-[#F8FAFC] hover:bg-[#EF4444]/25"
      >
        {t.nav.submit}
      </Link>
    </div>
  );
}
