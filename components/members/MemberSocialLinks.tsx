"use client";

import { SocialLinks, type SocialLinkItem } from "@/components/detail/SocialLinks";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { ClubMember } from "@/lib/types";
import {
  formatMemberHandleLabel,
  memberInstagramUrl,
} from "@/lib/utils/instagram";

type MemberSocialLinksProps = {
  member: ClubMember;
};

export function MemberSocialLinks({ member }: MemberSocialLinksProps) {
  const { t } = useLocale();
  const links: SocialLinkItem[] = [];

  const instagramHref = memberInstagramUrl(member);
  if (instagramHref) {
    links.push({
      href: instagramHref,
      label: formatMemberHandleLabel(member),
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
