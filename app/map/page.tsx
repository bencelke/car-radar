import type { Metadata } from "next";

import { MapPageClient } from "@/components/map/MapPageClient";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { loadMapItems } from "@/lib/data/map-items";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discovery Map",
  description: `Explore the car culture map on ${brand.appName}.`,
};

export default async function MapPage() {
  const items = await loadMapItems();

  return (
    <PageShell maxWidth="wide" className="px-0 py-0 md:px-4 md:py-5 lg:px-6 lg:py-6">
      <MapPageClient items={items} />
    </PageShell>
  );
}
