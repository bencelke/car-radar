"use client";

import { Calendar, Car, MapPin, Store, Users } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { HomeSceneStats } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

type HomeScenePulseProps = {
  stats: HomeSceneStats;
  className?: string;
};

const statConfig = [
  { key: "eventsThisWeek" as const, icon: Calendar, accent: "border-orange-500/20 text-orange-400" },
  { key: "clubsMapped" as const, icon: Users, accent: "border-blue-500/20 text-blue-400" },
  { key: "shopsListed" as const, icon: Store, accent: "border-amber-500/20 text-amber-400" },
  { key: "memberGarages" as const, icon: Car, accent: "border-purple-500/20 text-purple-400" },
];

const labelKeys = {
  eventsThisWeek: "statEventsThisWeek",
  clubsMapped: "statClubsMapped",
  shopsListed: "statShopsListed",
  memberGarages: "statGarages",
} as const;

export function HomeScenePulse({ stats, className }: HomeScenePulseProps) {
  const { t } = useLocale();

  const items = statConfig.map(({ key, icon: Icon, accent }) => ({
    key,
    Icon,
    accent,
    label: t.home[labelKeys[key]],
    value: stats[key],
  }));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">
          {t.home.scenePulse}
        </p>
        <p className="flex items-center gap-1 text-[10px] text-[#64748B]">
          <MapPin className="size-3 shrink-0" />
          {t.home.areaLabel}
        </p>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
        {items.map(({ key, Icon, accent, label, value }) => (
          <div
            key={key}
            className={cn(
              "min-w-[132px] shrink-0 rounded-xl border bg-[#0B1118]/70 px-3 py-2.5 backdrop-blur-sm lg:min-w-0",
              accent.split(" ")[0]
            )}
          >
            <Icon className={cn("size-3.5", accent.split(" ").slice(1).join(" "))} />
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
              {label}
            </p>
            <p className="font-heading text-xl font-bold text-[#F8FAFC]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
