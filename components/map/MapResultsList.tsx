"use client";

import Link from "next/link";
import {
  Activity,
  Heart,
  MapPin,
  Store,
  Users,
} from "lucide-react";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { MapItem } from "@/lib/types";
import { mapItemDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type MapResultsListProps = {
  items: MapItem[];
  selectedId: string | null;
  onSelect: (item: MapItem) => void;
  className?: string;
  maxItems?: number;
};

const typeIcons = {
  event: Activity,
  club: Heart,
  shop: Store,
  member: Users,
  zone: MapPin,
} as const;

export function MapResultsList({
  items,
  selectedId,
  onSelect,
  className,
  maxItems = 12,
}: MapResultsListProps) {
  const { t } = useLocale();
  const slice = items.slice(0, maxItems);

  if (slice.length === 0) {
    return (
      <GlassPanel className={cn("p-4 text-center text-sm text-white/45", className)}>
        {t.map.noResults}
      </GlassPanel>
    );
  }

  return (
    <GlassPanel
      className={cn(
        "flex max-h-[min(640px,calc(100vh-12rem))] flex-col overflow-hidden",
        className
      )}
    >
      <div className="border-b border-white/[0.06] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
          {t.map.resultsTitle}
        </p>
        <p className="mt-0.5 text-sm text-white/70">
          {t.map.visibleCount.replace("{count}", String(items.length))}
        </p>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {slice.map((item) => {
          const Icon = typeIcons[item.type] ?? MapPin;
          const href = mapItemDetailPath(item);
          const active = selectedId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  "flex w-full min-h-11 items-start gap-3 rounded-xl px-3 py-2.5 text-left transition",
                  active
                    ? "bg-[#EF4444]/10 ring-1 ring-[#EF4444]/30"
                    : "hover:bg-white/[0.04]"
                )}
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04]">
                  <Icon className="size-4 text-[#94A3B8]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[#F8FAFC]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[#64748B]">
                    {item.category} · {item.city}
                  </span>
                </span>
              </button>
              {href ? (
                <Link
                  href={href}
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                >
                  {t.detail.viewDetails}
                </Link>
              ) : null}
            </li>
          );
        })}
      </ul>
      {items.length > maxItems ? (
        <p className="border-t border-white/[0.06] px-4 py-2 text-center text-[10px] text-white/35">
          +{items.length - maxItems} more
        </p>
      ) : null}
    </GlassPanel>
  );
}
