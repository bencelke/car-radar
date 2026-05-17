"use client";

import { useState } from "react";

import { MockMapPanel } from "@/components/dashboard/MockMapPanel";
import type { MapPin } from "@/lib/types";

type MapViewProps = {
  mapPins: MapPin[];
  selectedPlaceId: string;
};

export function MapView({ mapPins, selectedPlaceId }: MapViewProps) {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(
    selectedPlaceId
  );

  return (
    <MockMapPanel
      mapPins={mapPins}
      selectedPinId={selectedPinId}
      onPinSelect={setSelectedPinId}
    />
  );
}
