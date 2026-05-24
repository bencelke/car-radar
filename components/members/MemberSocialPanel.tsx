"use client";

import { ExternalLink, Share2 } from "lucide-react";

import { GarageProfileCard } from "@/components/members/GarageProfileCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { ClubMember } from "@/lib/types";
import {
  formatMemberHandleLabel,
  memberInstagramUrl,
} from "@/lib/utils/instagram";
import { normalizeSocialUrl } from "@/lib/utils/social";

type MemberSocialPanelProps = {
  member: ClubMember;
};

export function MemberSocialPanel({ member }: MemberSocialPanelProps) {
  const { t } = useLocale();
  const instagramHref = memberInstagramUrl(member);
  const handle = formatMemberHandleLabel(member);

  const extras = [
    member.tiktok ? { href: member.tiktok, label: "TikTok" } : null,
    member.youtube ? { href: member.youtube, label: "YouTube" } : null,
  ].filter(Boolean) as { href: string; label: string }[];

  if (!instagramHref && extras.length === 0) return null;

  return (
    <GarageProfileCard title={t.members.socialLinks} compact>
      <div className="space-y-2">
        {instagramHref ? (
          <a
            href={normalizeSocialUrl(instagramHref)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#E1306C]/35 bg-gradient-to-r from-[#E1306C]/15 to-[#833AB4]/10 text-sm font-semibold text-[#F8FAFC] transition hover:border-[#E1306C]/50 hover:from-[#E1306C]/25"
          >
            <Share2 className="size-4 text-[#E1306C]" />
            <span className="truncate">{handle}</span>
          </a>
        ) : null}
        {extras.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {extras.map((link) => (
              <a
                key={link.label}
                href={normalizeSocialUrl(link.href)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#151B24]/60 px-2 py-1 text-[10px] font-medium text-[#CBD5E1] hover:text-[#F8FAFC]"
              >
                <ExternalLink className="size-3" />
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </GarageProfileCard>
  );
}
