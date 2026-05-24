"use client";

import { SocialLinks, type SocialLinkItem } from "@/components/detail/SocialLinks";
import { GarageProfileCard } from "@/components/members/GarageProfileCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Club } from "@/lib/types";

type ClubSocialPanelProps = {
  club: Club;
};

export function ClubSocialPanel({ club }: ClubSocialPanelProps) {
  const { t } = useLocale();
  const links: SocialLinkItem[] = [];

  if (club.instagram) {
    links.push({ href: club.instagram, label: "Instagram", kind: "instagram" });
  }
  if (club.tiktok) {
    links.push({ href: club.tiktok, label: "TikTok", kind: "website" });
  }
  if (club.youtube) {
    links.push({ href: club.youtube, label: "YouTube", kind: "website" });
  }
  if (club.website) {
    links.push({ href: club.website, label: t.common.website, kind: "website" });
  }

  if (links.length === 0) return null;

  return (
    <GarageProfileCard title={t.members.socialLinks} compact>
      <SocialLinks links={links} />
    </GarageProfileCard>
  );
}
