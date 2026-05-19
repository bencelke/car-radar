import type { Metadata } from "next";

import { ShopCard } from "@/components/cards/ShopCard";
import { SectionPage } from "@/components/shared/section-page";
import { brand } from "@/lib/config/brand";
import { getApprovedShops } from "@/lib/repositories/shops";

export const metadata: Metadata = {
  title: "Shops",
  description: `Find tuning shops, detailers, and specialists on ${brand.appName}.`,
};

export default async function ShopsPage() {
  const shops = await getApprovedShops();

  return (
    <SectionPage
      title="Shops & Services"
      description="Tuning, detailing, wraps, and wheel specialists near you."
      badge="Shops"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </SectionPage>
  );
}
