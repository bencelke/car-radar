"use client";

import Link from "next/link";
import {
  Activity,
  Bell,
  Car,
  Heart,
  Plus,
  Share2,
  Wrench,
} from "lucide-react";

import {
  elevatedPanelClass,
  sectionHeadingClass,
  sectionSubtextClass,
} from "@/components/profile/profile-ui";
import { ShareButton } from "@/components/share/ShareButton";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { GarageCar, GarageProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProfileQuickActionsProps = {
  garage: GarageProfile | null;
  car: GarageCar | null;
  className?: string;
};

type ActionItem = {
  href: string;
  label: string;
  description: string;
  icon: typeof Car;
  accent?: "red" | "blue" | "purple";
};

export function ProfileQuickActions({
  garage,
  car,
  className,
}: ProfileQuickActionsProps) {
  const { t } = useLocale();

  const actions: ActionItem[] = [
    {
      href: "/garage",
      label: t.profile.myGarage,
      description: t.profile.myGarageHint,
      icon: Car,
      accent: "red",
    },
    {
      href: "/garage",
      label: garage ? t.profile.editGarage : t.profile.createMyGarage,
      description: garage ? t.profile.editGarageHint : t.profile.buildYourGarageHint,
      icon: garage ? Wrench : Plus,
      accent: "blue",
    },
    {
      href: "/feed",
      label: t.profile.viewActivity,
      description: t.social.activityFeed,
      icon: Activity,
      accent: "purple",
    },
    {
      href: "/following",
      label: t.social.followingBuilds,
      description: t.social.noFollowedHint,
      icon: Heart,
      accent: "blue",
    },
    {
      href: "/notifications",
      label: t.notifications.notifications,
      description: t.profile.notificationPreferences,
      icon: Bell,
      accent: "purple",
    },
  ];

  const accentRing = {
    red: "group-hover:shadow-[0_0_20px_-8px_rgba(239,68,68,0.55)] group-hover:border-[#EF4444]/30",
    blue: "group-hover:shadow-[0_0_20px_-8px_rgba(59,130,246,0.5)] group-hover:border-[#3B82F6]/30",
    purple:
      "group-hover:shadow-[0_0_20px_-8px_rgba(168,85,247,0.45)] group-hover:border-[#A855F7]/30",
  };

  const iconBg = {
    red: "bg-[#EF4444]/15 text-[#FCA5A5]",
    blue: "bg-[#3B82F6]/15 text-[#93C5FD]",
    purple: "bg-[#A855F7]/15 text-[#C4B5FD]",
  };

  const canShare = Boolean(garage && car && garage.status === "published");

  return (
    <section className={className}>
      <h2 className={sectionHeadingClass}>{t.profile.quickActions}</h2>
      <p className={sectionSubtextClass}>{t.profile.quickActionsHint}</p>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;
          const accent = action.accent ?? "blue";
          return (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className={cn(
                "group flex min-h-[5.5rem] flex-col rounded-2xl border border-white/[0.06] bg-[#0B1118]/60 p-3 transition",
                elevatedPanelClass,
                accentRing[accent]
              )}
            >
              <span
                className={cn(
                  "mb-2 inline-flex size-9 items-center justify-center rounded-lg",
                  iconBg[accent]
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="text-sm font-medium text-[#F8FAFC]">
                {action.label}
              </span>
              <span className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[#64748B]">
                {action.description}
              </span>
            </Link>
          );
        })}

        {canShare && garage && car ? (
          <div
            className={cn(
              "group flex min-h-[5.5rem] flex-col rounded-2xl border border-white/[0.06] bg-[#0B1118]/60 p-3 transition",
              elevatedPanelClass,
              accentRing.purple
            )}
          >
            <span
              className={cn(
                "mb-2 inline-flex size-9 items-center justify-center rounded-lg",
                iconBg.purple
              )}
            >
              <Share2 className="size-4" />
            </span>
            <span className="text-sm font-medium text-[#F8FAFC]">
              {t.share.shareProfile}
            </span>
            <div className="mt-2">
              <ShareButton
                entity={{ type: "garage", garage, car }}
                inviteOptions={{ joinShiftIt: true }}
                compact
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
