"use client";

import { Camera, Car, Check, ClipboardCheck, User, Wrench } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

export const GARAGE_ONBOARDING_STEP_COUNT = 5;

export type GarageOnboardingStepId =
  | "profile"
  | "car"
  | "build"
  | "photo"
  | "review";

export const GARAGE_ONBOARDING_STEPS: {
  id: GarageOnboardingStepId;
  icon: typeof User;
}[] = [
  { id: "profile", icon: User },
  { id: "car", icon: Car },
  { id: "build", icon: Wrench },
  { id: "photo", icon: Camera },
  { id: "review", icon: ClipboardCheck },
];

type GarageProgressStepperProps = {
  currentStep: number;
  completedThrough: number;
  variant?: "rail" | "compact";
};

function stepLabel(
  id: GarageOnboardingStepId,
  t: ReturnType<typeof useLocale>["t"]
): string {
  switch (id) {
    case "profile":
      return t.garage.onboardingStepProfile;
    case "car":
      return t.garage.onboardingStepCar;
    case "build":
      return t.garage.onboardingStepBuild;
    case "photo":
      return t.garage.onboardingStepPhoto;
    case "review":
      return t.garage.onboardingStepReview;
  }
}

export function GarageProgressStepper({
  currentStep,
  completedThrough,
  variant = "rail",
}: GarageProgressStepperProps) {
  const { t } = useLocale();

  if (variant === "compact") {
    const current = GARAGE_ONBOARDING_STEPS[currentStep];
    const Icon = current?.icon ?? User;
    return (
      <div className="space-y-2" aria-label={t.garage.onboardingProgress}>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-[#94A3B8]">
            {t.garage.onboardingStepOf
              .replace("{current}", String(currentStep + 1))
              .replace("{total}", String(GARAGE_ONBOARDING_STEP_COUNT))}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-[#F8FAFC]">
            <Icon className="size-3.5 text-[#3B82F6]" />
            {current ? stepLabel(current.id, t) : ""}
          </span>
        </div>
        <div className="flex gap-1">
          {GARAGE_ONBOARDING_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                index <= completedThrough
                  ? "bg-gradient-to-r from-[#3B82F6] to-[#A855F7]"
                  : "bg-white/[0.08]"
              )}
              aria-hidden
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav
      className="space-y-1"
      aria-label={t.garage.onboardingProgress}
    >
      {GARAGE_ONBOARDING_STEPS.map((step, index) => {
        const Icon = step.icon;
        const isComplete = index < currentStep || index <= completedThrough;
        const isCurrent = index === currentStep;
        const status = isCurrent
          ? "current"
          : isComplete
            ? "complete"
            : "upcoming";

        return (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
              isCurrent && "bg-[#3B82F6]/10 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.25)]"
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                status === "complete" &&
                  "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
                status === "current" &&
                  "bg-[#3B82F6]/20 text-[#93C5FD] ring-1 ring-[#3B82F6]/35",
                status === "upcoming" &&
                  "bg-white/[0.04] text-[#64748B] ring-1 ring-white/[0.06]"
              )}
            >
              {status === "complete" ? (
                <Check className="size-4" aria-hidden />
              ) : (
                index + 1
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium",
                  isCurrent ? "text-[#F8FAFC]" : "text-[#94A3B8]"
                )}
              >
                <Icon className="size-3.5 shrink-0 opacity-80" />
                {stepLabel(step.id, t)}
              </span>
            </span>
          </div>
        );
      })}
    </nav>
  );
}
