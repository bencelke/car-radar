"use client";

import Link from "next/link";
import { Share2 } from "lucide-react";

import { FollowPlaceholderButton } from "@/components/members/FollowPlaceholderButton";
import { MemberRoleBadge } from "@/components/members/MemberRoleBadge";
import { useLocale } from "@/components/providers/LocaleProvider";
import { metaString } from "@/lib/map/map-utils";
import type { MapItem } from "@/lib/types";
import { mapItemDetailPath } from "@/lib/utils/entity-paths";
import { memberAvatarGradient } from "@/lib/members/roles";
import { normalizeSocialUrl } from "@/lib/utils/social";
import { cn } from "@/lib/utils";
import type { ClubMember } from "@/lib/types";

type MapMemberDetailProps = {
  item: MapItem;
};

function pseudoMember(item: MapItem): ClubMember {
  return {
    id: metaString(item, "entityId") ?? item.id.replace(/^member-/, ""),
    clubId: metaString(item, "clubId") ?? "",
    displayName: metaString(item, "displayName") ?? item.title,
    nickname: metaString(item, "nickname") || undefined,
    status: "approved",
    city: item.city,
    country: item.country,
    area: item.area,
    carMake: metaString(item, "carMake") || undefined,
    carModel: metaString(item, "carModel") || undefined,
    carYear: metaString(item, "carYear") || undefined,
    carName: metaString(item, "carName") || undefined,
    buildSummary: item.description || metaString(item, "buildSummary") || undefined,
    buildTags: item.tags,
    instagram: item.instagram,
    role: (metaString(item, "role") as ClubMember["role"]) ?? "member",
    clubName: metaString(item, "clubName") || undefined,
    verifiedByClub: item.verified,
  };
}

export function MapMemberDetail({ item }: MapMemberDetailProps) {
  const { t } = useLocale();
  const member = pseudoMember(item);
  const gradient = memberAvatarGradient(member);
  const initial = (member.displayName[0] ?? "?").toUpperCase();
  const carLine = [
    metaString(item, "carYear"),
    metaString(item, "carMake"),
    metaString(item, "carModel"),
  ]
    .filter(Boolean)
    .join(" ");
  const clubName = metaString(item, "clubName");
  const buildTags = metaString(item, "buildTags");
  const profileHref = mapItemDetailPath(item);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div
          className={cn(
            "flex size-16 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br text-xl font-bold text-white",
            gradient
          )}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg font-semibold text-white">
            {member.displayName}
          </h2>
          {member.nickname ? (
            <p className="text-xs text-white/50">{member.nickname}</p>
          ) : null}
          {carLine ? (
            <p className="mt-1 text-xs text-blue-200/80">{carLine}</p>
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
        {item.instagram ? (
          <a
            href={normalizeSocialUrl(item.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            <Share2 className="size-4" />
            {t.members.instagram}
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
