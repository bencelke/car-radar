"use client";

import { MapFilterBar } from "@/components/map/MapFilterBar";
import { MapSortControl } from "@/components/map/MapSortControl";
import { ResponsiveSheet } from "@/components/mobile/ResponsiveSheet";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { MapCategoryFilterId, MapFilterId, MapSortId } from "@/lib/types";

type MobileFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  typeFilter: MapFilterId;
  onTypeFilterChange: (filter: MapFilterId) => void;
  categoryFilter: MapCategoryFilterId;
  onCategoryFilterChange: (filter: MapCategoryFilterId) => void;
  sortMode?: MapSortId;
  onSortChange?: (sort: MapSortId) => void;
  counts: Record<MapFilterId, number>;
  onReset: () => void;
  onApply: () => void;
};

export function MobileFilterSheet({
  open,
  onOpenChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortMode,
  onSortChange,
  counts,
  onReset,
  onApply,
}: MobileFilterSheetProps) {
  const { t } = useLocale();

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      side="bottom"
      title={t.mobile.filters}
      closeLabel={t.mobile.closeFilters}
      panelClassName="max-h-[min(85dvh,760px)]"
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 flex-1 border-white/[0.12] bg-transparent text-[#CBD5E1]"
            onClick={onReset}
          >
            {t.mobile.resetFilters}
          </Button>
          <Button
            type="button"
            className="min-h-11 flex-1 border border-[#EF4444]/40 bg-[#EF4444]/20 text-[#F8FAFC] hover:bg-[#EF4444]/30"
            onClick={onApply}
          >
            {t.mobile.showResults}
          </Button>
        </div>
      }
    >
      {onSortChange && sortMode ? (
        <div className="mb-4">
          <MapSortControl value={sortMode} onChange={onSortChange} className="w-full" />
        </div>
      ) : null}

      <MapFilterBar
        active={typeFilter}
        counts={counts}
        onChange={onTypeFilterChange}
        categoryFilter={categoryFilter}
        onCategoryChange={onCategoryFilterChange}
      />
    </ResponsiveSheet>
  );
}
