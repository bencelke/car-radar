import type { Metadata } from "next";

import { MapPageClient } from "@/components/map/MapPageClient";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { loadMapItems } from "@/lib/data/map-items";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Map",
  description: `Explore the car culture map on ${brand.appName}.`,
};

export default async function MapPage() {
  const items = await loadMapItems();

  return (
    <PageShell>
      <MapPageClient items={items} />
    </PageShell>
  );
}
