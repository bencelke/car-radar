"use client";

import { Share2 } from "lucide-react";

import { MemberRoleBadge } from "@/components/members/MemberRoleBadge";
import { metaString } from "@/lib/map/map-utils";
import type { MapItem } from "@/lib/types";
import { normalizeSocialUrl } from "@/lib/utils/social";
import { cn } from "@/lib/utils";

type MemberMapHoverPreviewProps = {
  item: MapItem;
  style?: React.CSSProperties;
  className?: string;
};

function avatarGradient(item: MapItem): string {
  const make = metaString(item, "carMake")?.toLowerCase() ?? "";
  if (make.includes("bmw")) return "from-blue-600/80 to-indigo-900/60";
  if (make.includes("toyota") || make.includes("honda") || make.includes("nissan")) {
    return "from-red-600/70 to-rose-900/50";
  }
  return "from-violet-600/70 to-slate-900/50";
}

export function MemberMapHoverPreview({
  item,
  style,
  className,
}: MemberMapHoverPreviewProps) {
  const displayName = metaString(item, "displayName") ?? item.title;
  const nickname = metaString(item, "nickname");
  const carLine = [
    metaString(item, "carYear"),
    metaString(item, "carMake"),
    metaString(item, "carModel"),
  ]
    .filter(Boolean)
    .join(" ");
  const clubName = metaString(item, "clubName");
  const role = metaString(item, "role");
  const initial = (displayName[0] ?? "?").toUpperCase();

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-30 w-[220px] -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl border border-white/10 bg-[#0B1118]/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl",
        className
      )}
      style={style}
    >
      <div className="flex gap-2.5">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br text-sm font-bold text-white",
            avatarGradient(item)
          )}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold text-white">
            {displayName}
            {nickname ? (
              <span className="ml-1 font-normal text-white/50">({nickname})</span>
            ) : null}
          </p>
          {carLine ? (
            <p className="mt-0.5 truncate text-[11px] text-blue-200/80">{carLine}</p>
          ) : null}
          {clubName ? (
            <p className="mt-0.5 truncate text-[10px] text-white/45">{clubName}</p>
          ) : null}
          <div className="mt-1.5">
            <MemberRoleBadge role={role} size="xs" />
          </div>
        </div>
        {item.instagram ? (
          <a
            href={normalizeSocialUrl(item.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white"
            onClick={(e) => e.stopPropagation()}
            aria-label="Instagram"
          >
            <Share2 className="size-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
