"use client";

import Link from "next/link";
import { ExternalLink, MapPin, Share2, Star } from "lucide-react";

import { HomeEmptyPanel } from "@/components/home/HomeEmptyPanel";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { useLocale } from "@/components/providers/LocaleProvider";
import { shopToShopItem } from "@/lib/mappers/ui";
import type { CarShop } from "@/lib/types";
import { shopDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type HomeShopsNearYouProps = {
  shops: CarShop[];
};

function ShopDiscoveryCard({ shop }: { shop: CarShop }) {
  const item = shopToShopItem(shop);

  return (
    <Link
      href={shopDetailPath(shop)}
      className="group flex min-h-[88px] items-center gap-3 rounded-xl border border-white/[0.06] bg-[#0B1118]/70 p-3 transition hover:border-amber-500/25 hover:bg-[#151B24]/80 active:scale-[0.99]"
    >
      <div
        className={cn(
          "size-14 shrink-0 rounded-lg bg-gradient-to-br",
          item.gradient
        )}
      />
      <div className="min-w-0 flex-1">
        <h4 className="truncate text-sm font-semibold text-[#F8FAFC]">{shop.name}</h4>
        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-[#64748B]">
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px]">
            {item.category}
          </span>
          <span className="flex items-center gap-0.5">
            <MapPin className="size-3" />
            {shop.city}
          </span>
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#64748B]">
          {shop.rating != null && shop.rating > 0 ? (
            <span className="flex items-center gap-0.5 text-amber-400">
              <Star className="size-3 fill-current" />
              {shop.rating.toFixed(1)}
            </span>
          ) : null}
          {shop.instagram ? (
            <span className="flex items-center gap-0.5">
              <Share2 className="size-3" />
              IG
            </span>
          ) : null}
          {shop.website ? (
            <span className="flex items-center gap-0.5">
              <ExternalLink className="size-3" />
              Web
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function HomeShopsNearYou({ shops }: HomeShopsNearYouProps) {
  const { t } = useLocale();
  const nearby = shops.slice(0, 6);

  return (
    <section>
      <HomeSectionHeader
        title={t.home.shopsNearYou}
        href="/shops"
        actionLabel={t.home.viewShops}
      />
      {nearby.length === 0 ? (
        <HomeEmptyPanel
          message={t.home.noShopsListed}
          actionLabel={t.home.ctaListShop}
          actionHref="/submit?type=shop"
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nearby.map((shop) => (
            <ShopDiscoveryCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </section>
  );
}
