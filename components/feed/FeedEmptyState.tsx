"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers/LocaleProvider";

export function FeedEmptyState({ signedIn }: { signedIn: boolean }) {
  const { t } = useLocale();

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-6 text-center">
      <p className="text-sm font-medium text-[#F8FAFC]">
        {signedIn ? t.social.noFollowedBuilds : t.social.publicFeedEmpty}
      </p>
      <p className="mt-2 text-xs text-[#94A3B8]">
        {signedIn ? t.social.noFollowedHint : t.social.publicFeedHint}
      </p>
      {signedIn ? (
        <Link
          href="/following"
          className="mt-4 inline-block text-sm text-[#3B82F6] hover:underline"
        >
          {t.social.followingBuilds}
        </Link>
      ) : (
        <Link
          href="/login?next=/feed"
          className="mt-4 inline-block text-sm text-[#3B82F6] hover:underline"
        >
          {t.auth.login}
        </Link>
      )}
    </div>
  );
}
