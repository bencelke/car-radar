"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { ClubCard } from "@/components/cards/ClubCard";
import { EmptyStateCard } from "@/components/layout/EmptyStateCard";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { PublicSection } from "@/components/layout/PublicSection";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { submitRoute } from "@/lib/config/routes";
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
    <div className="space-y-6 sm:space-y-8">
      <PublicPageHeader
        title={t.clubs.heroTitle}
        subtitle={t.clubs.heroSubtitle}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              nativeButton={false}
              render={<Link href={submitRoute("club")} />}
              size="sm"
              className="min-h-11 border border-[#EF4444]/50 bg-[#EF4444]/20 px-4 text-[#F8FAFC] hover:bg-[#EF4444]/30"
            >
              <Plus className="mr-1.5 size-4" />
              {t.clubs.addYourClub}
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={submitRoute("club")} />}
              size="sm"
              variant="outline"
              className="min-h-11 border-white/[0.12] bg-[#151B24]/80 px-4 text-[#CBD5E1]"
            >
              {t.clubs.claimClub}
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-white/[0.06] bg-[#0B1118]/40 px-4 py-3 text-sm text-[#94A3B8]">
        {t.clubs.growthCopy}
      </div>

      <PublicSection>
        <div className="flex flex-col gap-4">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.clubs.searchPlaceholder}
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#151B24]/80 pl-10 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] outline-none focus:border-[#3B82F6]/40"
            />
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FILTER_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium sm:text-sm",
                  "min-h-11",
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
      </PublicSection>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((club) => (
            <ClubCard key={club.id} club={club} />
          ))}
        </div>
      ) : (
        <EmptyStateCard
          icon={Search}
          title={t.clubs.emptyTitle}
          description={t.clubs.emptyDescription}
          actions={[
            {
              label: t.clubs.addYourClub,
              href: submitRoute("club"),
              variant: "primary",
            },
          ]}
        />
      )}
    </div>
  );
}
