"use client";

import Link from "next/link";

import { CorrectionLink } from "@/components/detail/CorrectionLink";
import { DetailHero } from "@/components/detail/DetailHero";
import { InfoGrid } from "@/components/detail/InfoGrid";
import { RelatedSection } from "@/components/detail/RelatedSection";
import { SocialLinks, type SocialLinkItem } from "@/components/detail/SocialLinks";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club, ClubMember } from "@/lib/types";
import { clubDetailPath } from "@/lib/utils/entity-paths";

type MemberDetailViewProps = {
  member: ClubMember;
  club: Club | null;
};

function carLine(member: ClubMember): string {
  const parts = [member.carYear, member.carMake, member.carModel].filter(Boolean);
  return parts.join(" ") || member.carName || "";
}

export function MemberDetailView({ member, club }: MemberDetailViewProps) {
  const { t } = useLocale();
  const location = [member.city, member.area, member.country]
    .filter(Boolean)
    .join(" · ");

  const socialLinks: SocialLinkItem[] = [];
  if (member.instagram) {
    socialLinks.push({
      href: member.instagram,
      label: t.detail.visitInstagram,
      kind: "instagram",
    });
  }

  return (
    <div className="space-y-6">
      <DetailHero
        title={member.displayName}
        subtitle={member.nickname ? `“${member.nickname}”` : carLine(member)}
        typeBadge={member.carName ?? t.detail.build}
        verified={member.verifiedByClub}
        verifiedLabel={t.members.verifiedByClub}
        location={location}
        gradientClassName="from-blue-600/35 via-[#111827] to-red-600/25"
      >
        {member.buildSummary ? (
          <p className="text-sm leading-relaxed text-[#94A3B8]">
            {member.buildSummary}
          </p>
        ) : null}
      </DetailHero>

      <InfoGrid
        items={[
          { label: t.detail.build, value: carLine(member) },
          {
            label: t.detail.tags,
            value: member.buildTags?.length
              ? member.buildTags.join(", ")
              : null,
          },
        ]}
      />

      {socialLinks.length > 0 ? (
        <SocialLinks title={t.detail.socialLinks} links={socialLinks} />
      ) : null}

      {club ? (
        <RelatedSection title={t.detail.relatedClub}>
          <Link
            href={clubDetailPath(club)}
            className="block rounded-xl border border-white/[0.06] bg-[#151B24]/40 px-3 py-2.5 transition hover:border-white/[0.1]"
          >
            <p className="text-sm font-medium text-[#F8FAFC]">{club.name}</p>
            <p className="mt-0.5 text-xs text-[#64748B]">
              {club.type} · {club.city}
            </p>
          </Link>
        </RelatedSection>
      ) : null}

      <CorrectionLink
        targetType="member"
        targetName={member.displayName}
        entityId={member.id}
      />
    </div>
  );
}

