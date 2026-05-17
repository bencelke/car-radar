import type { Metadata } from "next";

import { ShopsPanel } from "@/components/dashboard/ShopsPanel";
import { SectionPage } from "@/components/shared/section-page";
import { brand } from "@/lib/config/brand";
import { shopToShopItem } from "@/lib/mappers/ui";
import { getApprovedShops } from "@/lib/repositories/shops";

export const metadata: Metadata = {
  title: "Shops",
  description: `Find tuning shops, detailers, and specialists on ${brand.appName}.`,
};

export default async function ShopsPage() {
  const shops = (await getApprovedShops()).map(shopToShopItem);

  return (
    <SectionPage
      title="Shops & Services"
      description="Tuning, detailing, wraps, and wheel specialists near you."
      badge="Shops"
    >
      <ShopsPanel shops={shops} />
    </SectionPage>
  );
}
