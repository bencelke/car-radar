"use client";

import { SocialLinks, type SocialLinkItem } from "@/components/detail/SocialLinks";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { ClubMember } from "@/lib/types";

type MemberSocialLinksProps = {
  member: ClubMember;
};

export function MemberSocialLinks({ member }: MemberSocialLinksProps) {
  const { t } = useLocale();
  const links: SocialLinkItem[] = [];

  if (member.instagram) {
    links.push({
      href: member.instagram,
      label: t.members.instagram,
      kind: "instagram",
    });
  }
  if (member.tiktok) {
    links.push({ href: member.tiktok, label: "TikTok", kind: "website" });
  }
  if (member.youtube) {
    links.push({ href: member.youtube, label: "YouTube", kind: "website" });
  }

  return <SocialLinks title={t.detail.socialLinks} links={links} />;
}
