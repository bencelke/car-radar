import Link from "next/link";
import { MapPin } from "lucide-react";

type MapPreviewCardProps = {
  city: string;
  mapHref?: string;
  openMapLabel?: string;
};

export function MapPreviewCard({
  city,
  mapHref = "/map",
  openMapLabel = "Open map",
}: MapPreviewCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80">
      <div className="relative h-32 bg-gradient-to-br from-[#3B82F6]/25 via-[#111827] to-[#EF4444]/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="size-10 text-white/20" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="text-sm text-[#94A3B8]">
          Explore markers around <span className="text-[#F8FAFC]">{city}</span>
        </p>
        <Link
          href={mapHref}
          className="shrink-0 rounded-lg border border-[#3B82F6]/40 bg-[#3B82F6]/15 px-3 py-1.5 text-xs font-medium text-[#93C5FD] hover:bg-[#3B82F6]/25"
        >
          {openMapLabel}
        </Link>
      </div>
    </div>
  );
}
