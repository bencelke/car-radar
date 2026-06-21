"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { ShopCard } from "@/components/cards/ShopCard";
import { EmptyStateCard } from "@/components/layout/EmptyStateCard";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { PublicSection } from "@/components/layout/PublicSection";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { submitRoute } from "@/lib/config/routes";
import type { CarShop } from "@/lib/types";
import { cn } from "@/lib/utils";

const FILTER_IDS = [
  "all",
  "tuning",
  "wheels",
  "wrap",
  "detailing",
  "performance",
  "parts",
] as const;

type ShopsDirectoryProps = {
  shops: CarShop[];
};

export function ShopsDirectory({ shops }: ShopsDirectoryProps) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTER_IDS)[number]>("all");

  const filterLabels: Record<(typeof FILTER_IDS)[number], string> = {
    all: t.shops.filterAll,
    tuning: t.shops.filterTuning,
    wheels: t.shops.filterWheels,
    wrap: t.shops.filterWrap,
    detailing: t.shops.filterDetailing,
    performance: t.shops.filterPerformance,
    parts: t.shops.filterParts,
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shops.filter((shop) => {
      const categoryHaystack = [
        shop.category,
        ...(shop.services ?? []),
      ]
        .join(" ")
        .toLowerCase();
      const tagMatch =
        filter === "all" ||
        categoryHaystack.includes(filter === "wrap" ? "wrap" : filter);
      if (!tagMatch) return false;
      if (!q) return true;
      const haystack = [
        shop.name,
        shop.category,
        shop.city,
        shop.country,
        shop.description,
        ...(shop.services ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [shops, query, filter]);

  const clearFilters = () => {
    setQuery("");
    setFilter("all");
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PublicPageHeader
        title={t.shops.heroTitle}
        subtitle={t.shops.heroSubtitle}
        actions={
          <Button
            nativeButton={false}
            render={<Link href={submitRoute("shop")} />}
            size="sm"
            className="min-h-11 border border-[#EF4444]/50 bg-[#EF4444]/20 px-4 text-[#F8FAFC] hover:bg-[#EF4444]/30"
          >
            <Plus className="mr-1.5 size-4" />
            {t.shops.listShop}
          </Button>
        }
      />

      <PublicSection>
        <div className="flex flex-col gap-4">
          <div className="relative max-w-lg">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.shops.searchPlaceholder}
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
            <span className="flex shrink-0 items-center rounded-full border border-white/[0.06] bg-[#151B24]/40 px-3.5 py-2 text-xs text-[#64748B]">
              {t.shops.sortFeatured}
            </span>
          </div>
        </div>
      </PublicSection>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      ) : (
        <EmptyStateCard
          icon={Search}
          title={t.shops.emptyTitle}
          description={t.shops.emptyDescription}
          actions={[
            {
              label: t.shops.listShop,
              href: submitRoute("shop"),
              variant: "primary",
            },
          ]}
        />
      )}

      {(query || filter !== "all") && filtered.length === 0 ? (
        <button
          type="button"
          onClick={clearFilters}
          className="mx-auto block min-h-11 text-sm text-[#3B82F6] hover:underline"
        >
          {t.map.clearFilters}
        </button>
      ) : null}
    </div>
  );
}
