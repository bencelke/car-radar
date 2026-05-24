"use client";

import { Share2 } from "lucide-react";

import { MemberAvatar } from "@/components/members/MemberAvatar";
import { MemberRoleBadge } from "@/components/members/MemberRoleBadge";
import { mapItemToClubMember } from "@/lib/members/map-item-member";
import { metaString } from "@/lib/map/map-utils";
import type { MapItem } from "@/lib/types";
import {
  formatMemberHandleLabel,
  memberInstagramUrl,
} from "@/lib/utils/instagram";
import { cn } from "@/lib/utils";

type MemberMapHoverPreviewProps = {
  item: MapItem;
  style?: React.CSSProperties;
  className?: string;
};

export function MemberMapHoverPreview({
  item,
  style,
  className,
}: MemberMapHoverPreviewProps) {
  const member = mapItemToClubMember(item);
  const handleLabel = formatMemberHandleLabel(member);
  const carLabel =
    member.carName?.trim() ||
    [metaString(item, "carYear"), metaString(item, "carMake"), metaString(item, "carModel")]
      .filter(Boolean)
      .join(" ");
  const clubName = metaString(item, "clubName");
  const instagramHref = memberInstagramUrl(member);

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-30 w-[220px] -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl border border-white/10 bg-[#0B1118]/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl",
        className
      )}
      style={style}
    >
      <div className="flex gap-2.5">
        <MemberAvatar member={member} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-semibold text-white">
            {handleLabel}
          </p>
          {carLabel ? (
            <p className="mt-0.5 truncate text-[11px] text-blue-200/80">{carLabel}</p>
          ) : null}
          {clubName ? (
            <p className="mt-0.5 truncate text-[10px] text-white/45">{clubName}</p>
          ) : null}
          <div className="mt-1.5">
            <MemberRoleBadge role={member.role} size="xs" />
          </div>
        </div>
        {instagramHref ? (
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:text-white"
            onClick={(e) => e.stopPropagation()}
            aria-label={handleLabel}
          >
            <Share2 className="size-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
