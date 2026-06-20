"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

import { ClubFollowButton } from "@/components/clubs/ClubFollowButton";
import { useLocale } from "@/components/providers/LocaleProvider";
import { brand } from "@/lib/config/brand";
import type { ClubPostAccess } from "@/lib/community/can-post-to-club";
import { cn } from "@/lib/utils";

type PostingPermissionCardProps = {
  access: ClubPostAccess;
  clubSlug: string;
  clubId: string;
  followerCount?: number;
  returnPath: string;
  className?: string;
};

export function PostingPermissionCard({
  access,
  clubSlug,
  clubId,
  followerCount = 0,
  returnPath,
  className,
}: PostingPermissionCardProps) {
  const { t } = useLocale();
  const loginNext = encodeURIComponent(returnPath);
  const signInHref = `${brand.nav.login.href}?next=${loginNext}`;
  const signUpHref = `${brand.nav.login.href}?mode=signUp&next=${loginNext}`;

  if (access.reason === "signed_out") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-[#3B82F6]/20 bg-gradient-to-br from-[#151B24]/80 to-[#0B1118]/60 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
          className
        )}
      >
        <h3 className="font-heading text-base font-semibold text-[#F8FAFC]">
          {t.communityPosts.joinConversation}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
          {t.communityPosts.joinConversationHint}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={signInHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#3B82F6]/40 bg-[#3B82F6]/20 px-4 text-sm font-semibold text-[#F8FAFC] transition hover:bg-[#3B82F6]/30"
          >
            <LogIn className="size-4" />
            {t.auth.signIn}
          </Link>
          <Link
            href={signUpHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.1] bg-[#151B24]/60 px-4 text-sm font-medium text-[#CBD5E1] transition hover:border-white/[0.16] hover:text-[#F8FAFC]"
          >
            <UserPlus className="size-4" />
            {t.auth.createAccount}
          </Link>
        </div>
      </div>
    );
  }

  if (access.reason === "firebase_unavailable") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-amber-500/20 bg-[#151B24]/50 px-5 py-4 text-sm text-[#FCD34D]",
          className
        )}
      >
        {t.communityPosts.postingUnavailable}
      </div>
    );
  }

  if (access.reason === "club_inactive") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/[0.08] bg-[#151B24]/40 px-5 py-4 text-sm text-[#94A3B8]",
          className
        )}
      >
        {t.communityPosts.clubInactive}
      </div>
    );
  }

  if (access.reason === "not_member") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/[0.08] bg-[#151B24]/50 p-5",
          className
        )}
      >
        <p className="text-sm text-[#94A3B8]">{t.communityPosts.postingMembersOnly}</p>
        <div className="mt-3">
          <ClubFollowButton
            clubId={clubId}
            clubSlug={clubSlug}
            initialFollowerCount={followerCount}
            returnPath={returnPath}
          />
        </div>
      </div>
    );
  }

  return null;
}
