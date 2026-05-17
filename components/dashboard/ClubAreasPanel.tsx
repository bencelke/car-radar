import { GlassPanel, PanelHeader } from "@/components/dashboard/glass-panel";
import { accentStyles } from "@/lib/config/accents";
import type { ClubArea } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClubAreasPanelProps = {
  clubAreas: ClubArea[];
};

export function ClubAreasPanel({ clubAreas }: ClubAreasPanelProps) {
  return (
    <GlassPanel>
      <PanelHeader title="Club Areas" />
      <div className="p-4 pt-0">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/[0.06] bg-[#05070A]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
            }}
          />
          {clubAreas.map((area) => {
            const accent = accentStyles[area.accent];
            return (
              <div
                key={area.id}
                style={{
                  top: area.position.top,
                  left: area.position.left,
                  width: area.width,
                  height: area.height,
                }}
                className={cn(
                  "absolute rounded-lg border-2 border-dashed backdrop-blur-sm",
                  accent.border,
                  accent.bg,
                  accent.glow
                )}
              >
                <span
                  className={cn(
                    "absolute -top-5 left-1 text-[9px] font-semibold",
                    accent.text
                  )}
                >
                  {area.name}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-[#64748B]">
          Glowing zones represent active club meetup areas and crew territories
          on the map. Tap a zone to explore members and events.
        </p>
      </div>
    </GlassPanel>
  );
}
