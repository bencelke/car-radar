"use client";

import Link from "next/link";
import {
  ArrowRight,
  Gauge,
  Share2,
  Users,
  Wrench,
} from "lucide-react";

import { ProfilePageBackground } from "@/components/profile/ProfilePageBackground";
import {
  premiumPanelClass,
  sectionHeadingClass,
} from "@/components/profile/profile-ui";
import { ShiftItLogo } from "@/components/brand/ShiftItLogo";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type GarageEmptyStateProps = {
  onStart: () => void;
};

const benefits = [
  { key: "showBuild" as const, icon: Gauge },
  { key: "trackMods" as const, icon: Wrench },
  { key: "shareGarage" as const, icon: Share2 },
  { key: "connectClubs" as const, icon: Users },
];

export function GarageEmptyState({ onStart }: GarageEmptyStateProps) {
  const { t } = useLocale();

  return (
    <ProfilePageBackground>
      <div className="mx-auto w-full max-w-[1180px] px-4 py-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-5 lg:py-10">
        <div
          className={cn(
            premiumPanelClass,
            "relative overflow-hidden",
            "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#EF4444]/40 before:to-transparent"
          )}
        >
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:p-10">
            <div className="flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
                ShiftIt
              </p>
              <h1 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl lg:text-4xl">
                {t.garage.buildYourGarage}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#94A3B8] sm:text-base">
                {t.garage.buildYourGarageHint}
              </p>

              <ul className="mt-6 space-y-3">
                {benefits.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.key}
                      className="flex items-start gap-3 text-sm text-[#CBD5E1]"
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-[#151B24]/80 text-[#93C5FD]">
                        <Icon className="size-4" />
                      </span>
                      <span>{t.garage.onboardingBenefits[item.key]}</span>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={onStart}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#EF4444]/45 bg-gradient-to-r from-[#EF4444]/30 to-[#A855F7]/25 px-6 text-sm font-semibold text-[#F8FAFC] shadow-[0_0_28px_-10px_rgba(239,68,68,0.55)] transition hover:from-[#EF4444]/40 hover:to-[#A855F7]/35"
                >
                  {t.garage.addMyCar}
                  <ArrowRight className="size-4" />
                </button>
                <Link
                  href="/following"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/[0.12] bg-[#151B24]/80 px-6 text-sm font-medium text-[#CBD5E1] transition hover:text-[#F8FAFC]"
                >
                  {t.garage.exploreBuilds}
                </Link>
              </div>
            </div>

            <div className="relative min-h-[240px] overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#080C12]/80 sm:min-h-[320px]">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(59,130,246,0.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59,130,246,0.08) 1px, transparent 1px)
                  `,
                  backgroundSize: "32px 32px",
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -right-8 top-8 size-48 rounded-full bg-[#3B82F6]/20 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -left-6 bottom-0 size-40 rounded-full bg-[#EF4444]/15 blur-3xl"
                aria-hidden
              />

              <div className="relative flex h-full flex-col items-center justify-center p-6">
                <div className="w-full max-w-[280px] rounded-2xl border border-white/[0.1] bg-[#0B1118]/70 p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                  <div className="mb-4 flex items-center justify-between">
                    <ShiftItLogo variant="nav" className="opacity-90" />
                    <span className="rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#93C5FD]">
                      Garage
                    </span>
                  </div>
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#151B24] to-[#0B1118]">
                    <div
                      className="absolute inset-x-[12%] bottom-[18%] h-[28%] rounded-t-[40%] bg-gradient-to-t from-[#1E293B] to-[#334155] shadow-[0_0_40px_-8px_rgba(59,130,246,0.5)]"
                      aria-hidden
                    />
                    <div
                      className="absolute left-[18%] top-[38%] size-[18%] rounded-full border-2 border-[#64748B]/60 bg-[#1E293B]"
                      aria-hidden
                    />
                    <div
                      className="absolute right-[18%] top-[38%] size-[18%] rounded-full border-2 border-[#64748B]/60 bg-[#1E293B]"
                      aria-hidden
                    />
                    <div
                      className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/50 to-transparent"
                      aria-hidden
                    />
                  </div>
                  <p className={cn(sectionHeadingClass, "mt-3 text-center text-xs")}>
                    {t.garage.onboardingVisualCaption}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfilePageBackground>
  );
}
