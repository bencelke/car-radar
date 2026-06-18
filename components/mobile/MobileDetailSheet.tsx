"use client";

import { MapDetailPanel } from "@/components/map/MapDetailPanel";
import { ResponsiveSheet } from "@/components/mobile/ResponsiveSheet";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { MapItem } from "@/lib/types";

type MobileDetailSheetProps = {
  item: MapItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileDetailSheet({
  item,
  open,
  onOpenChange,
}: MobileDetailSheetProps) {
  const { t } = useLocale();

  if (!item) return null;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      side="bottom"
      title={t.mobile.viewDetails}
      closeLabel={t.mobile.closeDetails}
      panelClassName="max-h-[min(55dvh,520px)]"
    >
      <MapDetailPanel item={item} variant="floating" className="border-0 bg-transparent p-0 shadow-none" />
    </ResponsiveSheet>
  );
}
