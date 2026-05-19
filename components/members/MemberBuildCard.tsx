"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import type { ClubMember } from "@/lib/types";
import { memberCarLine } from "@/lib/members/roles";

type MemberBuildCardProps = {
  member: ClubMember;
};

export function MemberBuildCard({ member }: MemberBuildCardProps) {
  const { t } = useLocale();
  const car = memberCarLine(member);

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 p-5 backdrop-blur-xl">
      <h2 className="font-heading mb-3 text-sm font-semibold uppercase tracking-wider text-[#64748B]">
        {t.members.carDetails}
      </h2>
      {car ? (
        <p className="font-heading text-lg font-bold text-[#F8FAFC]">{car}</p>
      ) : null}
      {member.carName ? (
        <p className="mt-1 text-sm text-[#94A3B8]">{member.carName}</p>
      ) : null}
      {member.buildSummary ? (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {t.members.buildSummary}
          </p>
          <p className="text-sm leading-relaxed text-[#94A3B8]">
            {member.buildSummary}
          </p>
        </div>
      ) : null}
      {member.buildTags && member.buildTags.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {t.members.buildTags}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {member.buildTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-2 py-0.5 text-[10px] text-[#F8FAFC]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
