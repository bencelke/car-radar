"use client";

import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import {
  GarageProgressStepper,
  GARAGE_ONBOARDING_STEP_COUNT,
} from "@/components/garage/GarageProgressStepper";
import { ProfilePageBackground } from "@/components/profile/ProfilePageBackground";
import {
  premiumPanelClass,
  sectionSubtextClass,
} from "@/components/profile/profile-ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type GarageOnboardingShellProps = {
  step: number;
  completedThrough: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  busy?: boolean;
  showBack?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function GarageOnboardingShell({
  step,
  completedThrough,
  title,
  subtitle,
  children,
  onBack,
  onContinue,
  continueLabel,
  continueDisabled,
  busy,
  showBack = true,
  secondaryLabel,
  onSecondary,
}: GarageOnboardingShellProps) {
  const { t } = useLocale();

  return (
    <ProfilePageBackground>
      <div className="mx-auto w-full max-w-[1150px] px-4 py-5 pb-[max(6rem,env(safe-area-inset-bottom))] sm:px-5 lg:py-8">
        <div className="mb-4 flex items-center justify-between gap-3 lg:mb-6">
          <Link
            href="/profile"
            className="inline-flex min-h-10 items-center gap-2 text-sm text-[#94A3B8] transition hover:text-[#F8FAFC]"
          >
            <ArrowLeft className="size-4" />
            {t.garage.backToProfile}
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B] lg:hidden">
            ShiftIt · {t.garage.myGarage}
          </p>
        </div>

        <div className="lg:hidden">
          <GarageProgressStepper
            currentStep={step}
            completedThrough={completedThrough}
            variant="compact"
          />
        </div>

        <div
          className={cn(
            premiumPanelClass,
            "relative mt-4 overflow-hidden lg:mt-0",
            "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#3B82F6]/35 before:to-transparent"
          )}
        >
          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden border-r border-white/[0.06] bg-[#080C12]/50 p-5 lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
                {t.garage.onboardingProgress}
              </p>
              <div className="mt-4">
                <GarageProgressStepper
                  currentStep={step}
                  completedThrough={completedThrough}
                  variant="rail"
                />
              </div>
            </aside>

            <div className="flex min-h-0 flex-col">
              <header className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
                <h1 className="font-heading text-xl font-bold tracking-tight text-[#F8FAFC] sm:text-2xl">
                  {title}
                </h1>
                {subtitle ? (
                  <p className={cn(sectionSubtextClass, "mt-2 max-w-2xl text-sm")}>
                    {subtitle}
                  </p>
                ) : null}
              </header>

              <div className="flex-1 px-5 py-5 sm:px-6 sm:py-6">{children}</div>

              <footer className="sticky bottom-0 z-10 border-t border-white/[0.06] bg-[#0B1118]/95 px-5 py-4 backdrop-blur-xl sm:px-6 lg:static lg:bg-transparent lg:backdrop-blur-none">
                <div className="flex items-center gap-3">
                  {showBack ? (
                    <button
                      type="button"
                      onClick={onBack}
                      disabled={busy}
                      className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-white/[0.12] bg-[#151B24]/80 px-4 text-sm font-medium text-[#CBD5E1] transition hover:text-[#F8FAFC] disabled:opacity-50 sm:flex-none sm:min-w-[7.5rem]"
                    >
                      {t.garage.back}
                    </button>
                  ) : null}
                  {secondaryLabel && onSecondary ? (
                    <button
                      type="button"
                      onClick={onSecondary}
                      disabled={busy}
                      className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-white/[0.08] bg-transparent px-4 text-sm font-medium text-[#94A3B8] transition hover:text-[#E2E8F0] disabled:opacity-50 sm:flex-none sm:min-w-[7.5rem]"
                    >
                      {secondaryLabel}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={onContinue}
                    disabled={continueDisabled || busy}
                    className="inline-flex min-h-12 flex-[2] items-center justify-center gap-2 rounded-xl border border-[#EF4444]/45 bg-gradient-to-r from-[#EF4444]/30 to-[#A855F7]/25 px-5 text-sm font-semibold text-[#F8FAFC] shadow-[0_0_24px_-10px_rgba(239,68,68,0.5)] transition hover:from-[#EF4444]/40 hover:to-[#A855F7]/35 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:flex-none sm:min-w-[10rem]"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    {continueLabel ?? t.garage.continue}
                  </button>
                </div>
                <p className="mt-2 text-center text-[10px] text-[#64748B] lg:hidden">
                  {t.garage.onboardingStepOf
                    .replace("{current}", String(step + 1))
                    .replace("{total}", String(GARAGE_ONBOARDING_STEP_COUNT))}
                </p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </ProfilePageBackground>
  );
}
