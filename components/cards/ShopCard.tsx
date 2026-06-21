"use client";

import Link from "next/link";
import { ExternalLink, Globe, Share2, Star } from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { shopToShopItem } from "@/lib/mappers/ui";
import { googleMapsDirectionsUrl } from "@/lib/map/map-utils";
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
  const hasLocation = shop.lat != null && shop.lng != null;

  return (
    <article className="group flex min-h-[260px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl transition hover:border-[#EF4444]/30">
      <Link href={href} className="block">
        <div className="relative h-20 overflow-hidden">
          <div className={cn("absolute inset-0 bg-gradient-to-br", item.gradient)} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(239,68,68,0.12),transparent_55%)]" />
          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/35 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/85 backdrop-blur-sm">
            {item.category}
          </span>
        </div>
        <div className="flex flex-col gap-1.5 p-4 pb-0">
          <h3 className="font-heading text-base font-bold text-[#F8FAFC] group-hover:text-white">
            {shop.name}
          </h3>
          <p className="text-xs text-[#64748B]">{shop.city}</p>
          {shop.description ? (
            <p className="line-clamp-2 text-xs text-[#94A3B8]">{shop.description}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {shop.rating != null && shop.rating > 0 ? (
              <span className="flex items-center gap-0.5 text-xs text-[#FACC15]">
                <Star className="size-3 fill-current" />
                {shop.rating.toFixed(1)}
              </span>
            ) : null}
            {shop.website ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#64748B]">
                <Globe className="size-3" />
                {t.map.website}
              </span>
            ) : null}
            {shop.instagram ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#64748B]">
                <Share2 className="size-3" />
                {t.map.instagram}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="mt-auto flex flex-col gap-2 p-4 pt-2">
        <Button
          nativeButton={false}
          render={<Link href={href} />}
          size="sm"
          className="h-11 w-full border border-white/[0.1] bg-[#151B24]/80 text-[#F8FAFC]"
        >
          {t.detail.viewDetails}
        </Button>
        {hasLocation ? (
          <a
            href={googleMapsDirectionsUrl(shop.lat!, shop.lng!)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-xs font-medium text-blue-100 hover:bg-blue-500/20"
          >
            <ExternalLink className="size-3.5" />
            {t.detail.directions}
          </a>
        ) : null}
      </div>
    </article>
  );
}
