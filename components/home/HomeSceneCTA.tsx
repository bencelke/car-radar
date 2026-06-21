"use client";

import Link from "next/link";
import { Calendar, Car, Store, Users } from "lucide-react";

import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

const ctaItems = [
  {
    id: "club",
    icon: Users,
    titleKey: "ctaAddClub" as const,
    href: "/submit?type=club",
    accent: "hover:border-blue-500/30 hover:shadow-[0_0_24px_-8px_rgba(59,130,246,0.35)]",
    iconClass: "text-blue-400",
  },
  {
    id: "event",
    icon: Calendar,
    titleKey: "ctaSubmitMeet" as const,
    href: "/submit?type=event",
    accent: "hover:border-orange-500/30 hover:shadow-[0_0_24px_-8px_rgba(249,115,22,0.35)]",
    iconClass: "text-orange-400",
  },
  {
    id: "shop",
    icon: Store,
    titleKey: "ctaListShop" as const,
    href: "/submit?type=shop",
    accent: "hover:border-amber-500/30 hover:shadow-[0_0_24px_-8px_rgba(245,158,11,0.35)]",
    iconClass: "text-amber-400",
  },
  {
    id: "garage",
    icon: Car,
    titleKey: "ctaClaimGarage" as const,
    href: "/members",
    accent: "hover:border-purple-500/30 hover:shadow-[0_0_24px_-8px_rgba(168,85,247,0.35)]",
    iconClass: "text-purple-400",
  },
];

export function HomeSceneCTA() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#151B24] via-[#0B1118] to-[#05070a] px-5 py-8 sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.08),transparent_50%)]" />

      <HomeSectionHeader title={t.home.buildSceneTitle} subtitle={t.home.buildSceneBody} />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ctaItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0B1118]/60 px-4 py-3.5 transition",
              item.accent
            )}
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
              <item.icon className={cn("size-4", item.iconClass)} />
            </span>
            <span className="text-sm font-semibold text-[#F8FAFC] group-hover:text-white">
              {t.home[item.titleKey]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
