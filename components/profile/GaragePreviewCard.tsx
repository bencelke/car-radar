"use client";

import Link from "next/link";
import { ArrowRight, Car, Wrench } from "lucide-react";

import {
  premiumPanelClass,
  sectionHeadingClass,
  statChipClass,
} from "@/components/profile/profile-ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import { displayNameFromUserLike } from "@/lib/auth/user-display";
import { buildStageLabel } from "@/lib/garage/labels";
import type { GarageCar, GarageProfile, UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type GaragePreviewCardProps = {
  garage: GarageProfile | null;
  car: GarageCar | null;
  modCount: number;
  updateCount: number;
  loading?: boolean;
  profile?: UserProfile | null;
  authDisplayName?: string | null;
};

export function GaragePreviewCard({
  garage,
  car,
  modCount,
  updateCount,
  loading,
  profile,
  authDisplayName,
}: GaragePreviewCardProps) {
  const { t } = useLocale();
  const ownerName = profile
    ? displayNameFromUserLike(profile, { displayName: authDisplayName })
    : garage?.displayName;

  if (loading) {
    return (
      <section className={cn(premiumPanelClass, "overflow-hidden p-0")}>
        <div className="animate-pulse">
          <div className="aspect-[16/9] bg-[#151B24] sm:aspect-auto sm:h-44 sm:w-2/5 sm:float-left" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-32 rounded bg-white/10" />
            <div className="h-6 w-48 rounded bg-white/10" />
            <div className="h-3 w-full max-w-sm rounded bg-white/5" />
            <div className="flex gap-2">
              <div className="h-7 w-16 rounded-lg bg-white/5" />
              <div className="h-7 w-20 rounded-lg bg-white/5" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!garage) {
    return (
      <section
        className={cn(
          premiumPanelClass,
          "relative overflow-hidden p-6 sm:p-8",
          "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gradient-to-b before:from-[#EF4444]/50 before:to-[#3B82F6]/50"
        )}
      >
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 text-[#FCA5A5]">
              <Car className="size-6" />
            </span>
            <div>
              <h2 className={sectionHeadingClass}>{t.profile.buildYourGarage}</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-[#94A3B8]">
                {t.profile.buildYourGarageHint}
              </p>
            </div>
          </div>
          <Link
            href="/garage"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#EF4444]/45 bg-gradient-to-r from-[#EF4444]/25 to-[#A855F7]/20 px-5 text-sm font-semibold text-[#F8FAFC] shadow-[0_0_24px_-10px_rgba(239,68,68,0.55)] transition hover:from-[#EF4444]/35 hover:to-[#A855F7]/30"
          >
            {t.profile.createMyGarage}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    );
  }

  const title = car
    ? [car.year, car.make, car.model].filter(Boolean).join(" ")
    : t.garage.addMyCar;

  return (
    <section className={cn(premiumPanelClass, "overflow-hidden")}>
      <div className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
        <div className="relative aspect-[16/10] bg-[#151B24] md:aspect-auto md:min-h-[220px]">
          {car?.primaryImageUrl ? (
            <>
              <div
                className="pointer-events-none absolute inset-0 bg-[#3B82F6]/20 blur-3xl"
                aria-hidden
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={car.primaryImageUrl}
                alt={title}
                className="relative size-full object-cover"
              />
            </>
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-[#64748B]">
              {t.garage.uploadPrimaryPhoto}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
            {t.profile.myGarage}
          </p>
          <h2 className="mt-1 font-heading text-xl font-bold text-[#F8FAFC]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#94A3B8]">{ownerName}</p>

          <div className="mt-3 flex flex-wrap gap-2">
            {car?.horsepower != null ? (
              <span
                className={cn(
                  statChipClass,
                  "border-[#EF4444]/30 bg-[#EF4444]/10 text-[#FCA5A5]"
                )}
              >
                {car.horsepower} {t.garage.horsepowerUnit}
              </span>
            ) : null}
            {car?.buildStage ? (
              <span
                className={cn(
                  statChipClass,
                  "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#93C5FD]"
                )}
              >
                {buildStageLabel(car.buildStage, t)}
              </span>
            ) : null}
            <span
              className={cn(
                statChipClass,
                "border-white/[0.08] bg-white/[0.04] text-[#CBD5E1]"
              )}
            >
              <Wrench className="mr-1 inline size-3" />
              {modCount} {t.garage.mods}
            </span>
            <span
              className={cn(
                statChipClass,
                "border-white/[0.08] bg-white/[0.04] text-[#CBD5E1]"
              )}
            >
              {updateCount} {t.garage.buildProgress}
            </span>
            {garage.clubName ? (
              <span
                className={cn(
                  statChipClass,
                  "border-[#A855F7]/30 bg-[#A855F7]/10 text-[#C4B5FD]"
                )}
              >
                {garage.clubName}
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/garage"
              className="inline-flex min-h-11 items-center rounded-xl border border-[#3B82F6]/35 bg-[#3B82F6]/15 px-4 text-sm font-medium text-[#F8FAFC] transition hover:bg-[#3B82F6]/25"
            >
              {t.profile.viewGarage}
            </Link>
            <Link
              href="/garage"
              className="inline-flex min-h-11 items-center rounded-xl border border-white/[0.1] bg-[#151B24]/80 px-4 text-sm font-medium text-[#CBD5E1] transition hover:text-[#F8FAFC]"
            >
              {t.profile.editGarage}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
