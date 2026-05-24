"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club, ClubMember } from "@/lib/types";
import { clubDetailPath } from "@/lib/utils/entity-paths";
import { cn } from "@/lib/utils";

type SpecChip = {
  label: string;
  value: string;
  href?: string;
};

type MemberSpecChipsProps = {
  member: ClubMember;
  club?: Club | null;
  className?: string;
};

function Chip({ label, value, href }: SpecChip) {
  const inner = (
    <>
      <span className="block text-[9px] font-semibold uppercase tracking-wider text-[#64748B]">
        {label}
      </span>
      <span className="mt-0.5 block break-words text-xs font-medium leading-snug text-[#E2E8F0]">
        {value}
      </span>
    </>
  );

  const className =
    "rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 backdrop-blur-sm transition hover:border-white/[0.12] hover:bg-white/[0.06]";

  if (href) {
    return (
      <Link href={href} className={cn(className, "min-w-0")}>
        {inner}
      </Link>
    );
  }

  return <div className={cn(className, "min-w-0")}>{inner}</div>;
}

export function MemberSpecChips({ member, club, className }: MemberSpecChipsProps) {
  const { t } = useLocale();
  const locationLine = [member.city, member.area].filter(Boolean).join(" · ");

  const chips: SpecChip[] = [];
  if (member.carMake?.trim()) {
    chips.push({ label: t.members.make, value: member.carMake.trim() });
  }
  if (member.carModel?.trim()) {
    chips.push({ label: t.members.model, value: member.carModel.trim() });
  }
  if (member.carYear?.trim()) {
    chips.push({ label: t.members.year, value: member.carYear.trim() });
  }
  if (club) {
    chips.push({
      label: t.members.clubAffiliation,
      value: club.name,
      href: clubDetailPath(club),
    });
  } else if (member.clubName?.trim()) {
    chips.push({ label: t.members.clubAffiliation, value: member.clubName.trim() });
  }
  if (locationLine) {
    chips.push({ label: t.members.area, value: locationLine });
  }

  if (chips.length === 0) return null;

  return (
    <div className={className}>
      <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">
        {t.members.quickSpecs}
      </p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {chips.map((chip) => (
          <Chip key={`${chip.label}-${chip.value}`} {...chip} />
        ))}
      </div>
    </div>
  );
}
