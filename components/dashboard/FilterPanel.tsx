"use client";

import { MapPin, Search } from "lucide-react";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { brand } from "@/lib/config/brand";
import { filterOptions } from "@/lib/mock-data/car-radar";
import { cn } from "@/lib/utils";

type FilterPanelProps = {
  activeFilter: string;
  onFilterChange: (id: string) => void;
};

export function FilterPanel({ activeFilter, onFilterChange }: FilterPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <GlassPanel className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
          <input
            type="search"
            placeholder="Search city, area or place"
            className="h-9 w-full rounded-xl border border-white/[0.08] bg-[#151B24]/80 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#3B82F6]/50 focus:ring-1 focus:ring-[#3B82F6]/30"
          />
        </div>
      </GlassPanel>

      <GlassPanel className="p-3">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
          Filters
        </p>
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-medium transition",
                activeFilter === filter.id
                  ? "border-[#EF4444]/50 bg-[#EF4444]/15 text-[#F8FAFC] shadow-[0_0_12px_-4px_rgba(239,68,68,0.4)]"
                  : "border-white/[0.06] bg-[#151B24]/60 text-[#64748B] hover:border-white/[0.1] hover:text-[#CBD5E1]"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#3B82F6]/30 bg-[#3B82F6]/10">
            <MapPin className="size-4 text-[#3B82F6]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
              {brand.location.label}
            </p>
            <p className="mt-1 font-heading text-sm font-semibold text-[#F8FAFC]">
              {brand.location.city}, {brand.location.country}
            </p>
            <p className="text-xs text-[#64748B]">
              within {brand.location.radiusKm} km
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-medium text-[#3B82F6] hover:underline"
            >
              Change
            </button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
