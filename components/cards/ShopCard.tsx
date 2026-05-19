"use client";

import Link from "next/link";
import { Star } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { shopToShopItem } from "@/lib/mappers/ui";
import type { CarShop } from "@/lib/types";
import { shopDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type ShopCardProps = {
  shop: CarShop;
};

export function ShopCard({ shop }: ShopCardProps) {
  const { t } = useLocale();
  const item = shopToShopItem(shop);
  const href = shopDetailPath(shop);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl transition hover:border-[#EF4444]/30">
      <div
        className={cn(
          "h-24 bg-gradient-to-br",
          item.gradient
        )}
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-heading text-base font-bold text-[#F8FAFC]">
          {shop.name}
        </h3>
        <p className="text-xs text-[#64748B]">
          {item.category} · {shop.city}
        </p>
        {shop.description ? (
          <p className="line-clamp-2 text-xs text-[#94A3B8]">{shop.description}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          {shop.rating != null && shop.rating > 0 ? (
            <span className="flex items-center gap-0.5 text-xs text-[#FACC15]">
              <Star className="size-3 fill-current" />
              {shop.rating.toFixed(1)}
            </span>
          ) : (
            <span />
          )}
          <Button
            nativeButton={false}
            render={<Link href={href} />}
            size="sm"
            className="h-8 border border-white/[0.1] bg-[#151B24]/80 text-[#F8FAFC] hover:bg-[#151B24]"
          >
            {t.detail.viewDetails}
          </Button>
        </div>
      </div>
    </article>
  );
}
