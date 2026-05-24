"use client";

import Link from "next/link";

import { GarageProfileCard } from "@/components/members/GarageProfileCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import { memberCarLine } from "@/lib/members/roles";
import type { Club, ClubMember } from "@/lib/types";
import { clubDetailPath } from "@/lib/utils/entity-paths";
import {
  formatMemberHandleLabel,
  memberInstagramUrl,
} from "@/lib/utils/instagram";
type SnapshotTile = {
  label: string;
  value: string;
  href?: string;
};

function SnapshotTile({ label, value, href }: SnapshotTile) {
  const body = (
    <>
      <span className="block text-[9px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
        {label}
      </span>
      <span className="mt-1 block text-sm font-semibold leading-snug text-[#F8FAFC]">
        {value}
      </span>
    </>
  );

  const tileClass =
    "min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 py-2 backdrop-blur-sm transition hover:border-white/[0.12] hover:bg-white/[0.06]";

  if (href) {
    return (
      <Link href={href} className={tileClass}>
        {body}
      </Link>
    );
  }

  return <div className={tileClass}>{body}</div>;
}

type MemberGarageSnapshotProps = {
  member: ClubMember;
  club?: Club | null;
  className?: string;
};

export function MemberGarageSnapshot({
  member,
  club,
  className,
}: MemberGarageSnapshotProps) {
  const { t } = useLocale();
  const carLabel =
    member.carName?.trim() || memberCarLine(member) || "—";
  const areaLine = [member.city, member.area].filter(Boolean).join(" · ");
  const handle = formatMemberHandleLabel(member);
  const instagramHref = memberInstagramUrl(member);

  const tiles: SnapshotTile[] = [
    { label: t.members.car, value: carLabel },
  ];

  if (member.carMake?.trim()) {
    tiles.push({ label: t.members.make, value: member.carMake.trim() });
  }
  if (member.carModel?.trim()) {
    tiles.push({ label: t.members.model, value: member.carModel.trim() });
  }
  if (club) {
    tiles.push({
      label: t.members.club,
      value: club.name,
      href: clubDetailPath(club),
    });
  } else if (member.clubName?.trim()) {
    tiles.push({ label: t.members.club, value: member.clubName.trim() });
  }
  if (areaLine) {
    tiles.push({ label: t.members.area, value: areaLine });
  }
  if (handle && handle !== "?") {
    tiles.push({
      label: t.members.instagram,
      value: handle,
      href: instagramHref,
    });
  }

  return (
    <GarageProfileCard
      title={t.members.garageSnapshot}
      compact
      accent="red"
      className={className}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map((tile) => (
          <SnapshotTile key={`${tile.label}-${tile.value}`} {...tile} />
        ))}
      </div>
    </GarageProfileCard>
  );
}
