"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { ClubCard } from "@/components/cards/ClubCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTER_IDS = [
  "all",
  "bmw",
  "jdm",
  "muscle",
  "classic",
  "drift",
  "mixed",
] as const;

type ClubsDirectoryProps = {
  clubs: Club[];
};

export function ClubsDirectory({ clubs }: ClubsDirectoryProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTER_IDS)[number]>("all");

  const filterLabels: Record<(typeof FILTER_IDS)[number], string> = {
    all: t.clubs.filterAll,
    bmw: t.clubs.filterBmw,
    jdm: t.clubs.filterJdm,
    muscle: t.clubs.filterMuscle,
    classic: t.clubs.filterClassic,
    drift: t.clubs.filterDrift,
    mixed: t.clubs.filterMixed,
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clubs.filter((club) => {
      const tagMatch =
        filter === "all" ||
        club.tags?.some((tag) => tag.toLowerCase().includes(filter)) ||
        club.category?.toLowerCase().includes(filter) ||
        club.type.toLowerCase().includes(filter);
      if (!tagMatch) return false;
      if (!q) return true;
      const haystack = [
        club.name,
        club.type,
        club.city,
        club.area,
        club.country,
        club.description,
        ...(club.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [clubs, query, filter]);

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl">
          {t.clubs.heroTitle}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#64748B] sm:text-base">
          {t.clubs.heroSubtitle}
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.clubs.searchPlaceholder}
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#151B24]/80 pl-10 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#3B82F6]/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                filter === id
                  ? "border-[#EF4444]/50 bg-[#EF4444]/15 text-[#F8FAFC]"
                  : "border-white/[0.06] bg-[#151B24]/60 text-[#64748B] hover:text-[#CBD5E1]"
              )}
            >
              {filterLabels[id]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((club) => (
          <ClubCard key={club.id} club={club} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-[#64748B]">No clubs match your search.</p>
      ) : null}
    </div>
  );
}
