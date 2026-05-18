"use client";

import { ArrowDownUp } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { MapSortId } from "@/lib/types";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: { id: MapSortId; labelKey: keyof typeof import("@/lib/i18n/en").en.map }[] = [
  { id: "featured", labelKey: "sortFeatured" },
  { id: "nearest", labelKey: "sortNearest" },
  { id: "newest", labelKey: "sortNewest" },
  { id: "alphabetical", labelKey: "sortAlphabetical" },
  { id: "type", labelKey: "sortType" },
];

type MapSortControlProps = {
  value: MapSortId;
  onChange: (sort: MapSortId) => void;
  className?: string;
};

export function MapSortControl({ value, onChange, className }: MapSortControlProps) {
  const { t } = useLocale();

  return (
    <label
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0B1118]/90 px-3 py-2 text-xs backdrop-blur-md",
        className
      )}
    >
      <ArrowDownUp className="size-3.5 shrink-0 text-white/40" aria-hidden />
      <span className="sr-only">{t.map.sortBy}</span>
      <span className="hidden text-white/45 sm:inline">{t.map.sortBy}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as MapSortId)}
        className="cursor-pointer bg-transparent font-medium text-white/85 outline-none"
        aria-label={t.map.sortBy}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-[#0B1118] text-white">
            {t.map[opt.labelKey]}
          </option>
        ))}
      </select>
    </label>
  );
}
