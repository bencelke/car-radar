"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club } from "@/lib/types";
import { clubDetailPath } from "@/lib/utils/entity-paths";

type MemberClubCardProps = {
  club: Club;
};

export function MemberClubCard({ club }: MemberClubCardProps) {
  const { t } = useLocale();

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 p-5 backdrop-blur-xl">
      <h2 className="font-heading mb-3 text-sm font-semibold uppercase tracking-wider text-[#64748B]">
        {t.members.clubAffiliation}
      </h2>
      <Link
        href={clubDetailPath(club)}
        className="block rounded-xl border border-white/[0.06] bg-[#151B24]/50 p-4 transition hover:border-[#3B82F6]/30 hover:bg-[#151B24]/80"
      >
        <p className="font-heading text-base font-bold text-[#F8FAFC]">
          {club.name}
        </p>
        <p className="mt-1 text-xs text-[#64748B]">
          {club.type} · {club.city}
          {club.area ? ` · ${club.area}` : ""}
        </p>
      </Link>
    </section>
  );
}
