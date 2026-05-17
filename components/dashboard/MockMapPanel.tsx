"use client";

import { Layers, Minus, Navigation, Plus } from "lucide-react";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { accentStyles } from "@/lib/config/accents";
import { dashboardStats } from "@/lib/mock-data/car-radar";
import type { MapPin } from "@/lib/types";
import { cn } from "@/lib/utils";

type MockMapPanelProps = {
  selectedPinId: string | null;
  onPinSelect: (id: string) => void;
  mapPins: MapPin[];
};

export function MockMapPanel({
  selectedPinId,
  onPinSelect,
  mapPins,
}: MockMapPanelProps) {
  return (
    <GlassPanel className="relative flex min-h-[420px] flex-col overflow-hidden lg:min-h-[520px]">
      <MapSurface />

      <div className="pointer-events-none absolute inset-0 z-10 p-3">
        <div className="grid max-w-[140px] grid-cols-1 gap-2 sm:max-w-none sm:grid-cols-2 lg:grid-cols-2">
          {dashboardStats.map((stat) => (
            <div key={stat.id} className="pointer-events-auto">
              <StatCard stat={stat} />
            </div>
          ))}
        </div>
      </div>

      {mapPins.map((pin) => {
        const accent = accentStyles[pin.accent];
        const selected = selectedPinId === pin.id;
        return (
          <button
            key={pin.id}
            type="button"
            onClick={() => onPinSelect(pin.id)}
            style={{ top: pin.position.top, left: pin.position.left }}
            className={cn(
              "absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105",
              selected && "z-30 scale-105"
            )}
          >
            <div
              className={cn(
                "relative rounded-lg border bg-[#0B1118]/95 px-2 py-1.5 backdrop-blur-md",
                accent.border,
                selected && accent.glow
              )}
            >
              <span
                className={cn(
                  "absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-b border-r bg-[#0B1118]/95",
                  accent.border
                )}
              />
              <p className="whitespace-nowrap text-[11px] font-semibold text-[#F8FAFC]">
                {pin.name}
              </p>
              <p className={cn("text-[9px]", accent.text)}>{pin.category}</p>
              <span
                className={cn(
                  "absolute -bottom-3 left-1/2 size-2 -translate-x-1/2 rounded-full",
                  accent.dot,
                  "shadow-[0_0_12px_2px] shadow-current"
                )}
              />
            </div>
          </button>
        );
      })}

      <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
        <button
          type="button"
          className="rounded-full border border-white/[0.1] bg-[#111827]/90 px-4 py-2 text-xs font-medium text-[#F8FAFC] backdrop-blur-md transition hover:border-[#3B82F6]/40 hover:shadow-[0_0_20px_-6px_rgba(59,130,246,0.4)]"
        >
          Search this area
        </button>
      </div>

      <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1.5">
        {[
          { icon: Plus, label: "Zoom in" },
          { icon: Minus, label: "Zoom out" },
          { icon: Navigation, label: "Locate" },
          { icon: Layers, label: "Layers" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#111827]/90 text-[#64748B] backdrop-blur-md transition hover:border-white/[0.12] hover:text-[#CBD5E1]"
          >
            <Icon className="size-3.5" />
          </button>
        ))}
      </div>
    </GlassPanel>
  );
}

function MapSurface() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-[#05070A]"
      style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 60% at 50% 40%, rgba(59,130,246,0.08), transparent 60%),
          radial-gradient(ellipse 50% 40% at 70% 60%, rgba(168,85,247,0.06), transparent 50%),
          radial-gradient(ellipse 40% 30% at 30% 70%, rgba(239,68,68,0.05), transparent 50%),
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize:
          "100% 100%, 100% 100%, 100% 100%, 80px 80px, 80px 80px, 20px 20px, 20px 20px",
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full opacity-30"
        preserveAspectRatio="none"
      >
        <path
          d="M0,180 Q120,140 200,160 T400,120 T600,200 T800,150 T100%,180"
          fill="none"
          stroke="rgba(100,116,139,0.25)"
          strokeWidth="2"
        />
        <path
          d="M0,280 Q150,250 300,270 T500,240 T700,300 T100%,260"
          fill="none"
          stroke="rgba(100,116,139,0.2)"
          strokeWidth="1.5"
        />
        <path
          d="M100,0 Q200,100 180,200 T220,400 T200,100%"
          fill="none"
          stroke="rgba(100,116,139,0.15)"
          strokeWidth="1"
        />
        <path
          d="M240,0 Q280,150 260,300 T270,400"
          fill="none"
          stroke="rgba(100,116,139,0.15)"
          strokeWidth="1"
        />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-transparent to-[#05070A]/40" />
    </div>
  );
}
