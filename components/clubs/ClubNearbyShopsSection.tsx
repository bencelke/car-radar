"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import { shopToShopItem } from "@/lib/mappers/ui";
import type { CarShop, Club } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClubNearbyShopsSectionProps = {
  club: Club;
  shops: CarShop[];
};

export function ClubNearbyShopsSection({ club, shops }: ClubNearbyShopsSectionProps) {
  const { t } = useLocale();
  const items = shops.map(shopToShopItem);

  return (
    <GlassPanel>
      <PanelHeader
        title={t.clubs.nearbyShops}
        action={
          <Link href="/shops" className="text-[10px] text-[#3B82F6] hover:underline">
            View all
          </Link>
        }
      />
      <ul className="divide-y divide-white/[0.05]">
        {items.length > 0 ? (
          items.map((shop) => (
            <li
              key={shop.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#151B24]/50"
            >
              <div
                className={cn(
                  "size-9 shrink-0 rounded-lg bg-gradient-to-br",
                  shop.gradient
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-[#F8FAFC]">
                  {shop.name}
                </p>
                <p className="text-[10px] text-[#64748B]">
                  {shop.category} · {shop.city}
                </p>
              </div>
              <span className="flex items-center gap-0.5 text-[10px] text-[#FACC15]">
                <Star className="size-3 fill-current" />
                {shop.rating}
              </span>
            </li>
          ))
        ) : (
          <li className="px-4 py-6 text-center text-sm text-[#64748B]">
            {t.clubs.noShops}
          </li>
        )}
      </ul>
    </GlassPanel>
  );
}
