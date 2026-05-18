"use client";

import { AlertTriangle } from "lucide-react";

import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { MapErrorCategory } from "@/lib/map/map-config";
import { cn } from "@/lib/utils";

type MapFallbackProps = {
  children?: React.ReactNode;
  variant?: MapErrorCategory;
  embedded?: boolean;
  className?: string;
};

function useFallbackCopy(variant: MapErrorCategory) {
  const { t } = useLocale();
  switch (variant) {
    case "missing-token":
      return { title: t.map.tokenMissingTitle, hint: t.map.tokenMissingHint };
    case "init-failed":
      return { title: t.map.mapInitFailedTitle, hint: t.map.mapInitFailedHint };
    case "auth":
      return { title: t.map.mapAuthFailedTitle, hint: t.map.mapAuthFailedHint };
    default:
      return { title: t.map.mapUnknownErrorTitle, hint: t.map.mapUnknownErrorHint };
  }
}

function FallbackSurface({
  children,
  className,
  embedded,
}: {
  children?: React.ReactNode;
  className?: string;
  embedded?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[640px] flex-1 flex-col overflow-hidden",
        !embedded && "rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(59,130,246,0.12), transparent 60%), linear-gradient(180deg, #0a1018 0%, #05070a 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {children}
    </div>
  );
}

export function MapFallback({
  children,
  variant = "missing-token",
  embedded = false,
  className,
}: MapFallbackProps) {
  const { title, hint } = useFallbackCopy(variant);

  const warning = (
    <div className="absolute bottom-4 left-4 right-4 z-20 rounded-xl border border-amber-500/30 bg-[#0B1118]/95 p-4 backdrop-blur-md sm:left-4 sm:right-auto sm:max-w-md">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" />
        <div>
          <p className="font-heading text-sm font-semibold text-amber-100">
            {title}
          </p>
          <p className="mt-1 text-xs text-white/60">{hint}</p>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <FallbackSurface embedded className={cn("absolute inset-0 z-20", className)}>
        {children}
        {warning}
      </FallbackSurface>
    );
  }

  return (
    <GlassPanel className={cn("relative min-h-[640px] flex-1 overflow-hidden lg:min-h-[560px]", className)}>
      <FallbackSurface embedded className="min-h-[640px] h-full">
        {children}
        {warning}
      </FallbackSurface>
    </GlassPanel>
  );
}
