import { ExternalLink } from "lucide-react";

import { googleMapsDirectionsUrl } from "@/lib/map/map-utils";
import { cn } from "@/lib/utils";

type DirectionsButtonProps = {
  lat: number;
  lng: number;
  label: string;
  className?: string;
};

export function DirectionsButton({ lat, lng, label, className }: DirectionsButtonProps) {
  return (
    <a
      href={googleMapsDirectionsUrl(lat, lng)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-blue-500/20",
        className
      )}
    >
      <ExternalLink className="size-4" />
      {label}
    </a>
  );
}
