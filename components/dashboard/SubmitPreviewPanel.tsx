import Link from "next/link";
import { MapPin, Plus } from "lucide-react";

import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { Button } from "@/components/ui/button";

export function SubmitPreviewPanel() {
  return (
    <GlassPanel>
      <PanelHeader title="Submit to CarRadar" />
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10">
          <MapPin className="size-6 text-[#EF4444]" />
        </div>
        <p className="max-w-xs text-sm text-[#94A3B8]">
          Add a shop, event, club, member build, or correction. Every submission
          is reviewed before it goes live on the map.
        </p>
        <Button
          nativeButton={false}
          render={<Link href="/submit" />}
          className="border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC] hover:bg-[#EF4444]/30"
        >
          <Plus className="mr-2 size-4" />
          Submit for Review
        </Button>
      </div>
    </GlassPanel>
  );
}
