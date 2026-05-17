"use client";

import {
  BadgeCheck,
  ExternalLink,
  Share2,
  MapPin,
  Navigation,
  Star,
} from "lucide-react";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";
import { accentStyles } from "@/lib/config/accents";
import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";

type PlaceDetailPanelProps = {
  place: Place;
};

export function PlaceDetailPanel({ place }: PlaceDetailPanelProps) {
  const accent = accentStyles[place.accent];

  return (
    <GlassPanel elevated className="flex max-h-[calc(100vh-5rem)] flex-col overflow-hidden">
      <div
        className={cn(
          "relative h-36 shrink-0 bg-gradient-to-br",
          place.gradient
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1118] to-transparent" />
        {place.verified ? (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
            <BadgeCheck className="size-3" />
            Verified
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        <h2 className="font-heading text-lg font-bold text-[#F8FAFC]">
          {place.name}
        </h2>
        <p className={cn("text-xs font-medium", accent.text)}>{place.category}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#CBD5E1]">
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-[#FACC15] text-[#FACC15]" />
            {place.rating}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3 text-[#64748B]" />
            {place.city}, {place.country}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              place.status === "open"
                ? "bg-[#22C55E]/15 text-[#22C55E]"
                : "bg-[#EF4444]/15 text-[#EF4444]"
            )}
          >
            {place.status === "open" ? "Open now" : "Closed"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Directions", icon: Navigation },
            { label: "Website", icon: ExternalLink },
            { label: "Instagram", icon: Share2 },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.08] bg-[#151B24]/80 py-2 text-[10px] font-medium text-[#CBD5E1] transition hover:border-white/[0.12] hover:bg-[#151B24]"
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[#64748B]">
          {place.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {place.services.map((service) => (
            <span
              key={service}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                accent.border,
                accent.bg,
                accent.text
              )}
            >
              {service}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
            Instagram
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-lg bg-gradient-to-br",
                  i % 2 === 0
                    ? "from-[#EF4444]/30 to-[#F97316]/20"
                    : "from-[#A855F7]/30 to-[#3B82F6]/20"
                )}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full border-white/[0.08] bg-[#151B24]/60 text-[#CBD5E1] hover:bg-[#151B24]"
          >
            See all photos
          </Button>
        </div>
      </div>
    </GlassPanel>
  );
}
