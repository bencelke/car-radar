"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { GarageCar, GarageProfile } from "@/lib/types";
import { buildStageLabel } from "@/lib/garage/labels";

type GarageHeroProps = {
  garage: GarageProfile;
  car: GarageCar | null;
  publicHref?: string;
};

export function GarageHero({ garage, car, publicHref }: GarageHeroProps) {
  const { t } = useLocale();
  const title = car
    ? [car.year, car.make, car.model].filter(Boolean).join(" ")
    : t.garage.addMyCar;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80">
      <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="relative aspect-[16/10] bg-[#151B24]">
          {car?.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={car.primaryImageUrl}
              alt={title}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-[#64748B]">
              {t.garage.uploadPrimaryPhoto}
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center p-4 md:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
            {t.garage.garageOverview}
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-[#F8FAFC]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#94A3B8]">{garage.displayName}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {car?.horsepower != null ? (
              <span className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-2 py-1 text-[#FCA5A5]">
                {car.horsepower} {t.garage.horsepowerUnit}
              </span>
            ) : null}
            {car?.buildStage ? (
              <span className="rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2 py-1 text-[#93C5FD]">
                {buildStageLabel(car.buildStage, t)}
              </span>
            ) : null}
            <span className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[#CBD5E1]">
              {garage.status === "published"
                ? t.garage.garageProfilePublished
                : t.garage.draft}
            </span>
          </div>
          {publicHref && garage.status === "published" ? (
            <Link
              href={publicHref}
              className="mt-4 text-xs font-medium text-[#3B82F6] hover:underline"
            >
              {t.garage.viewPublicProfile}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
