"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2, UserPlus, UserCheck } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";
import {
  followClub,
  getClubFollowerCount,
  isFollowingClub,
  unfollowClub,
} from "@/lib/repositories/club-follows";
import { cn } from "@/lib/utils";

type ClubFollowButtonProps = {
  clubId: string;
  clubSlug: string;
  initialFollowerCount?: number;
  returnPath?: string;
  className?: string;
};

export function ClubFollowButton({
  clubId,
  clubSlug,
  initialFollowerCount = 0,
  returnPath,
  className,
}: ClubFollowButtonProps) {
  const { t } = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const count = await getClubFollowerCount(clubId);
      if (!cancelled) {
        setFollowerCount(count);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clubId]);

  useEffect(() => {
    if (!user) {
      setFollowing(false);
      return;
    }
    let cancelled = false;
    void isFollowingClub(user.uid, clubId).then((value) => {
      if (!cancelled) setFollowing(value);
    });
    return () => {
      cancelled = true;
    };
  }, [user, clubId]);

  const loginHref = `${brand.nav.login.href}?next=${encodeURIComponent(returnPath ?? `/clubs/${clubSlug}`)}`;

  const toggle = useCallback(async () => {
    if (!user) {
      router.push(loginHref);
      return;
    }
    setBusy(true);
    setError(null);
    const prevFollowing = following;
    const prevCount = followerCount;
    try {
      if (following) {
        setFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
        await unfollowClub(user.uid, clubId);
      } else {
        setFollowing(true);
        setFollowerCount((c) => c + 1);
        await followClub(user.uid, clubId);
      }
    } catch {
      setFollowing(prevFollowing);
      setFollowerCount(prevCount);
      setError(t.community.followError);
    } finally {
      setBusy(false);
    }
  }, [user, following, followerCount, clubId, router, loginHref, t.community.followError]);

  if (authLoading && !loaded) {
    return (
      <div className={cn("h-9 w-28 animate-pulse rounded-lg bg-white/5", className)} />
    );
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {!user ? (
          <Button
            nativeButton={false}
            render={<Link href={loginHref} />}
            size="sm"
            className="h-9 border border-[#3B82F6]/40 bg-[#3B82F6]/15 text-[#F8FAFC]"
          >
            <UserPlus className="size-3.5" />
            {t.community.followClub}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={busy}
            onClick={() => void toggle()}
            className={cn(
              "h-9 min-w-[7rem] border text-[#F8FAFC]",
              following
                ? "border-[#22C55E]/40 bg-[#22C55E]/15"
                : "border-[#EF4444]/40 bg-[#EF4444]/15"
            )}
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : following ? (
              <>
                <UserCheck className="size-3.5" />
                {t.community.following}
              </>
            ) : (
              <>
                <UserPlus className="size-3.5" />
                {t.community.followClub}
              </>
            )}
          </Button>
        )}
        <span className="text-xs text-[#94A3B8]">
          {followerCount.toLocaleString()} {t.community.followers}
        </span>
      </div>
      {error ? <p className="text-[10px] text-red-300">{error}</p> : null}
      {!user ? (
        <p className="text-[10px] text-[#64748B]">{t.community.signInToFollow}</p>
      ) : null}
    </div>
  );
}
