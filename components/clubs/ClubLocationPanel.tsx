"use client";

import { MapPin } from "lucide-react";

import { GarageProfileCard } from "@/components/members/GarageProfileCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club } from "@/lib/types";

type ClubLocationPanelProps = {
  club: Club;
};

export function ClubLocationPanel({ club }: ClubLocationPanelProps) {
  const { t } = useLocale();
  const line = [club.city, club.area, club.country].filter(Boolean).join(" · ");
  if (!line) return null;

  return (
    <GarageProfileCard title={t.members.location} compact>
      <div className="flex gap-2">
        <MapPin className="size-3.5 shrink-0 text-[#3B82F6]" aria-hidden />
        <p className="text-sm font-medium text-[#E2E8F0]">{line}</p>
      </div>
      <p className="mt-1.5 text-[9px] text-[#64748B]">{t.members.locationApproximate}</p>
    </GarageProfileCard>
  );
}
