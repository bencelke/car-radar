import type { Metadata } from "next";

import { MapView } from "@/app/map/map-view";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { loadDashboardData } from "@/lib/data/dashboard";

export const metadata: Metadata = {
  title: "Map",
  description: `Explore the car culture map on ${brand.appName}.`,
};

export default async function MapPage() {
  const { mapPins, selectedPlaceId } = await loadDashboardData();

  return (
    <PageShell
      title="Discovery Map"
      description="Full-screen map view — Mapbox integration coming later."
    >
      <MapView mapPins={mapPins} selectedPlaceId={selectedPlaceId} />
    </PageShell>
  );
}
