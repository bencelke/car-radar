"use client";

import { MemberBuildTags } from "@/components/members/MemberBuildTags";
import { GarageProfileCard } from "@/components/members/GarageProfileCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import { memberCarLine } from "@/lib/members/roles";
import type { ClubMember } from "@/lib/types";

type MemberCarSpecCardProps = {
  member: ClubMember;
};

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] sm:w-28">
        {label}
      </dt>
      <dd className="text-sm font-medium text-[#E2E8F0]">{value}</dd>
    </div>
  );
}

export function MemberCarSpecCard({ member }: MemberCarSpecCardProps) {
  const { t } = useLocale();
  const carLine = memberCarLine(member);
  const hasSpecs =
    Boolean(member.carName?.trim()) ||
    Boolean(member.carMake) ||
    Boolean(member.carModel) ||
    Boolean(member.carYear) ||
    Boolean(member.buildSummary) ||
    (member.buildTags?.length ?? 0) > 0;

  return (
    <GarageProfileCard title={t.members.carOverview} accent="red">
      {hasSpecs ? (
        <div className="space-y-4">
          <dl className="space-y-3">
            <SpecRow label={t.submit.carName} value={member.carName} />
            <SpecRow label={t.submit.carMake} value={member.carMake} />
            <SpecRow label={t.submit.carModel} value={member.carModel} />
            <SpecRow label={t.submit.carYear} value={member.carYear} />
          </dl>
          {carLine && !member.carName ? (
            <p className="font-heading text-lg font-bold text-[#F8FAFC]">{carLine}</p>
          ) : null}
          {member.buildSummary ? (
            <div className="border-t border-white/[0.06] pt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {t.members.buildSummary}
              </p>
              <p className="text-sm leading-relaxed text-[#94A3B8]">
                {member.buildSummary}
              </p>
            </div>
          ) : null}
          {member.buildTags && member.buildTags.length > 0 ? (
            <div className="border-t border-white/[0.06] pt-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {t.members.buildTags}
              </p>
              <MemberBuildTags tags={member.buildTags} />
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-[#64748B]">{carLine || "—"}</p>
      )}
    </GarageProfileCard>
  );
}
