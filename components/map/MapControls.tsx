"use client";

import { Crosshair, Map, Minus, Plus } from "lucide-react";
import Link from "next/link";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

export type MapControlsVariant = "full" | "dashboard";

type MapControlsProps = {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRecenter?: () => void;
  fullMapHref?: string;
  variant?: MapControlsVariant;
  disabled?: boolean;
  className?: string;
};

const controlBtnClass =
  "flex size-9 items-center justify-center text-[#94A3B8] transition hover:border-[#3B82F6]/35 hover:bg-[#1E293B]/90 hover:text-[#F8FAFC] hover:shadow-[0_0_16px_-4px_rgba(59,130,246,0.45)] disabled:pointer-events-none disabled:opacity-40";

export function MapControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
  fullMapHref,
  variant = "dashboard",
  disabled = false,
  className,
}: MapControlsProps) {
  const { t } = useLocale();

  return (
    <div
      role="toolbar"
      aria-label={t.map.mapControlsLabel}
      className={cn(
        "pointer-events-auto flex flex-col gap-0.5 rounded-xl border border-white/[0.08] bg-[#0B1118]/92 p-1 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.65)] backdrop-blur-xl",
        variant === "dashboard" && "carradar-map-controls--dashboard",
        className
      )}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onZoomIn}
        aria-label={t.map.zoomIn}
        className={cn(controlBtnClass, "rounded-t-lg")}
      >
        <Plus className="size-4" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onZoomOut}
        aria-label={t.map.zoomOut}
        className={controlBtnClass}
      >
        <Minus className="size-4" strokeWidth={2.25} />
      </button>
      <div className="mx-1 h-px bg-white/[0.06]" aria-hidden />
      <button
        type="button"
        disabled={disabled}
        onClick={onRecenter}
        aria-label={t.map.recenter}
        className={controlBtnClass}
      >
        <Crosshair className="size-4" strokeWidth={2} />
      </button>
      {fullMapHref ? (
        <>
          <div className="mx-1 h-px bg-white/[0.06]" aria-hidden />
          <Link
            href={fullMapHref}
            aria-label={t.map.openFullMap}
            className={cn(controlBtnClass, "rounded-b-lg")}
          >
            <Map className="size-4" strokeWidth={2} />
          </Link>
        </>
      ) : null}
    </div>
  );
}
