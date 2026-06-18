"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type MobileMapToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
  fullMapHref?: string;
  className?: string;
};

export function MobileMapToolbar({
  search,
  onSearchChange,
  onOpenFilters,
  activeFilterCount,
  fullMapHref,
  className,
}: MobileMapToolbarProps) {
  const { t } = useLocale();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-[30] flex flex-col gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden",
        className
      )}
    >
      {searchOpen ? (
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.mobile.searchMap}
              autoFocus
              className="h-11 w-full rounded-xl border border-white/10 bg-[#0B1118]/95 py-2 pl-10 pr-10 text-sm text-white placeholder:text-white/35 focus:border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label={t.mobile.clearSearch}
                className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/50 hover:text-white"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label={t.mobile.closeDetails}
            className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0B1118]/95 text-[#CBD5E1]"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={t.mobile.searchMap}
            className="flex size-11 items-center justify-center rounded-xl border border-white/10 bg-[#0B1118]/92 text-[#CBD5E1] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <Search className="size-4" />
          </button>

          <button
            type="button"
            onClick={onOpenFilters}
            aria-label={t.mobile.filters}
            className="relative flex h-11 min-w-11 items-center gap-1.5 rounded-xl border border-white/10 bg-[#0B1118]/92 px-3 text-xs font-semibold text-[#F8FAFC] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.65)] backdrop-blur-xl"
          >
            <SlidersHorizontal className="size-4" />
            {t.mobile.filters}
            {activeFilterCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          {fullMapHref ? (
            <Link
              href={fullMapHref}
              className="ml-auto flex h-11 items-center rounded-xl border border-white/10 bg-[#0B1118]/92 px-3 text-xs font-medium text-[#CBD5E1] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            >
              {t.mobile.openFullMap}
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
}
