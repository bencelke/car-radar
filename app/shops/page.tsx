import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { ShopsDirectory } from "@/components/shops/ShopsDirectory";
import { brand } from "@/lib/config/brand";
import { getApprovedShops } from "@/lib/repositories/shops";

export const metadata: Metadata = {
  title: "Shops & Services",
  description: `Find tuning shops, detailers, and specialists on ${brand.appName}.`,
};

export default async function ShopsPage() {
  const shops = await getApprovedShops();

  return (
    <PageShell maxWidth="default">
      <ShopsDirectory shops={shops} />
    </PageShell>
  );
}
