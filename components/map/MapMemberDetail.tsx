"use client";

import Link from "next/link";
import { Share2 } from "lucide-react";

import { FollowPlaceholderButton } from "@/components/members/FollowPlaceholderButton";
import { MemberAvatar } from "@/components/members/MemberAvatar";
import { MemberCarPhoto } from "@/components/members/MemberCarPhoto";
import { MemberRoleBadge } from "@/components/members/MemberRoleBadge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { mapItemToClubMember } from "@/lib/members/map-item-member";
import { metaString } from "@/lib/map/map-utils";
import type { MapItem } from "@/lib/types";
import { mapItemDetailPath } from "@/lib/utils/entity-paths";
import {
  formatMemberHandleLabel,
  memberInstagramUrl,
} from "@/lib/utils/instagram";

type MapMemberDetailProps = {
  item: MapItem;
};

export function MapMemberDetail({ item }: MapMemberDetailProps) {
  const { t } = useLocale();
  const member = mapItemToClubMember(item);
  const handleLabel = formatMemberHandleLabel(member);
  const carLabel =
    member.carName?.trim() ||
    [metaString(item, "carYear"), metaString(item, "carMake"), metaString(item, "carModel")]
      .filter(Boolean)
      .join(" ");
  const clubName = metaString(item, "clubName");
  const buildTags = metaString(item, "buildTags");
  const profileHref = mapItemDetailPath(item);
  const instagramHref = memberInstagramUrl(member);

  const hasPhoto = Boolean(member.imageUrl ?? member.avatarUrl);

  return (
    <div className="space-y-4">
      {hasPhoto ? (
        <MemberCarPhoto member={member} variant="compact" className="rounded-lg" />
      ) : null}
      <div className="flex gap-3">
        <MemberAvatar member={member} size="md" />
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-white">
            {handleLabel}
          </h2>
          {carLabel ? (
            <p className="mt-1 text-xs text-blue-200/80">{carLabel}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <MemberRoleBadge role={member.role} size="xs" />
          </div>
        </div>
      </div>

      {item.description ? (
        <p className="text-sm leading-relaxed text-white/65">{item.description}</p>
      ) : null}

      {buildTags ? (
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {t.members.buildTags}
          </p>
          <p className="text-xs text-white/60">{buildTags}</p>
        </div>
      ) : null}

      {clubName ? (
        <p className="text-xs text-white/50">
          {t.members.clubAffiliation}: {clubName}
        </p>
      ) : null}

      <p className="text-xs text-white/45">
        {t.members.location}: {item.city}
        {item.area ? ` · ${item.area}` : ""}, {item.country}
      </p>

      <FollowPlaceholderButton fullWidth />

      <div className="flex flex-col gap-2">
        {instagramHref ? (
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <Share2 className="size-4" />
            {handleLabel}
          </a>
        ) : null}
        {profileHref ? (
          <Link
            href={profileHref}
            className="inline-flex items-center justify-center rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/15 px-4 py-2.5 text-sm font-medium text-[#F8FAFC] hover:bg-[#EF4444]/25"
          >
            {t.members.viewFullProfile}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
