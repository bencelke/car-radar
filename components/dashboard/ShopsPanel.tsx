import Link from "next/link";
import { ExternalLink, Share2, Star } from "lucide-react";

import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import type { ShopItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type ShopsPanelProps = {
  shops: ShopItem[];
};

export function ShopsPanel({ shops }: ShopsPanelProps) {
  return (
    <GlassPanel>
      <PanelHeader
        title="Shops"
        action={
          <Link
            href="/shops"
            className="text-[10px] font-medium text-[#3B82F6] hover:underline"
          >
            View all
          </Link>
        }
      />
      <ul className="divide-y divide-white/[0.05]">
        {shops.map((shop) => (
          <li
            key={shop.id}
            className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-[#151B24]/50"
          >
            <div
              className={cn(
                "size-10 shrink-0 rounded-lg bg-gradient-to-br",
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
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex items-center gap-0.5 text-[10px] text-[#FACC15]">
                <Star className="size-3 fill-current" />
                {shop.rating}
              </span>
              <button
                type="button"
                aria-label="Instagram"
                className="text-[#64748B] hover:text-[#F8FAFC]"
              >
                <Share2 className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Website"
                className="text-[#64748B] hover:text-[#F8FAFC]"
              >
                <ExternalLink className="size-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}
