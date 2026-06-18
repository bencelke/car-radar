"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { GarageModCategory, GarageModStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export type GarageModFilterId = "all" | GarageModStatus;
export type GarageModCategoryFilterId = "all" | GarageModCategory;

type GarageModFiltersProps = {
  statusFilter: GarageModFilterId;
  categoryFilter: GarageModCategoryFilterId;
  onStatusChange: (id: GarageModFilterId) => void;
  onCategoryChange: (id: GarageModCategoryFilterId) => void;
};

const statusFilters: GarageModFilterId[] = [
  "all",
  "installed",
  "planned",
  "ordered",
];

const categoryFilters: GarageModCategoryFilterId[] = [
  "all",
  "engine",
  "turbo",
  "exhaust",
  "suspension",
  "wheels",
  "body",
  "other",
];

export function GarageModFilters({
  statusFilter,
  categoryFilter,
  onStatusChange,
  onCategoryChange,
}: GarageModFiltersProps) {
  const { t } = useLocale();

  const statusLabel = (id: GarageModFilterId) => {
    switch (id) {
      case "installed":
        return t.garage.installed;
      case "planned":
        return t.garage.planned;
      case "ordered":
        return t.garage.ordered;
      default:
        return t.garage.filterAll;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {statusFilters.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onStatusChange(id)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide",
              statusFilter === id
                ? "bg-[#3B82F6]/20 text-[#F8FAFC]"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            )}
          >
            {statusLabel(id)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] uppercase tracking-wide text-[#64748B]">
          {t.garage.category}
        </span>
        <select
          value={categoryFilter}
          onChange={(e) =>
            onCategoryChange(e.target.value as GarageModCategoryFilterId)
          }
          className="rounded-lg border border-white/[0.08] bg-[#0B1118] px-2 py-1 text-[10px] text-[#CBD5E1]"
        >
          {categoryFilters.map((id) => (
            <option key={id} value={id}>
              {id === "all" ? t.garage.filterAll : id}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
