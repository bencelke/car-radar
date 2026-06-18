"use client";

import Link from "next/link";

import { GarageFollowButton } from "@/components/garage/GarageFollowButton";
import { useLocale } from "@/components/providers/LocaleProvider";
import { buildStageLabel } from "@/lib/garage/labels";
import { carTitle } from "@/lib/garage/feed-generator";
import type { GarageCar, GarageProfile } from "@/lib/types";

type DiscoverGarageCardProps = {
  garage: GarageProfile;
  car: GarageCar | null;
};

export function DiscoverGarageCard({ garage, car }: DiscoverGarageCardProps) {
  const { t } = useLocale();
  const title = car ? carTitle(car) : garage.displayName;

  return (
    <article className="w-[260px] shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0B1118]/80">
      <div className="aspect-[16/10] bg-[#151B24]">
        {car?.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.primaryImageUrl}
            alt={title}
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="space-y-2 p-3">
        <div>
          <p className="truncate font-medium text-[#F8FAFC]">{garage.displayName}</p>
          <p className="truncate text-xs text-[#94A3B8]">{title}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] text-[#64748B]">
          {car?.horsepower != null ? <span>{car.horsepower} hp</span> : null}
          {car?.buildStage ? (
            <span>{buildStageLabel(car.buildStage, t)}</span>
          ) : null}
          {garage.clubName ? <span>{garage.clubName}</span> : null}
        </div>
        <GarageFollowButton
          garage={garage}
          returnPath={`/garage/${garage.id}`}
          compact
        />
        <Link
          href={`/garage/${garage.id}`}
          className="block text-xs text-[#3B82F6] hover:underline"
        >
          {t.social.viewGarage}
        </Link>
      </div>
    </article>
  );
}

type FeaturedGaragesSectionProps = {
  featured: Array<{ garage: GarageProfile; car: GarageCar | null }>;
  recent: Array<{ garage: GarageProfile; car: GarageCar | null }>;
  popular: Array<{ garage: GarageProfile; car: GarageCar | null }>;
};

export function FeaturedGaragesSection({
  featured,
  recent,
  popular,
}: FeaturedGaragesSectionProps) {
  const { t } = useLocale();

  const sections = [
    { title: t.social.featuredGarages, items: featured },
    { title: t.social.recentlyUpdated, items: recent },
    { title: t.social.popularBuilds, items: popular },
  ].filter((s) => s.items.length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="space-y-4">
      {sections.map(({ title, items }) => (
        <section key={title}>
          <h2 className="mb-2 text-sm font-semibold text-[#F8FAFC]">{title}</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {items.map(({ garage, car }) => (
              <DiscoverGarageCard key={garage.id} garage={garage} car={car} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
