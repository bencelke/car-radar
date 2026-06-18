"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Loader2, UserCheck, UserPlus } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import {
  canFollowGarage,
  garageFollowLoginNext,
} from "@/lib/garage/garage-follow";
import { auth } from "@/lib/firebase/client";
import {
  followGarage,
  getFollowerCount,
  isFollowingGarage,
  unfollowGarage,
} from "@/lib/repositories/garage-follows";
import type { GarageProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type GarageFollowButtonProps = {
  garage: GarageProfile;
  returnPath: string;
  className?: string;
  compact?: boolean;
};

export function GarageFollowButton({
  garage,
  returnPath,
  className,
  compact = false,
}: GarageFollowButtonProps) {
  const { t } = useLocale();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(garage.followerCount ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const isOwner = user?.uid === garage.ownerUid;
  const canFollow = canFollowGarage(garage, user?.uid);
  const loginHref = garageFollowLoginNext(returnPath);

  useEffect(() => {
    let cancelled = false;
    void getFollowerCount(garage.id).then((count) => {
      if (!cancelled) {
        setFollowerCount(count);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [garage.id]);

  useEffect(() => {
    if (!user) {
      setFollowing(false);
      return;
    }
    let cancelled = false;
    void isFollowingGarage(user.uid, garage.id).then((value) => {
      if (!cancelled) setFollowing(value);
    });
    return () => {
      cancelled = true;
    };
  }, [user, garage.id]);

  const notifyOwner = useCallback(async () => {
    if (!auth?.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await fetch("/api/garage/follow-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          garageId: garage.id,
          followerDisplayName:
            auth.currentUser.displayName ?? auth.currentUser.email ?? undefined,
        }),
      });
    } catch {
      /* non-blocking */
    }
  }, [garage.id]);

  const toggle = useCallback(async () => {
    if (!user) {
      router.push(loginHref);
      return;
    }
    if (isOwner || !canFollow) return;

    setBusy(true);
    setError(null);
    const prevFollowing = following;
    const prevCount = followerCount;
    try {
      if (following) {
        await unfollowGarage(user.uid, garage.id);
        setFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      } else {
        await followGarage(user.uid, garage.id, garage.ownerUid);
        setFollowing(true);
        setFollowerCount((c) => c + 1);
        void notifyOwner();
      }
    } catch {
      setFollowing(prevFollowing);
      setFollowerCount(prevCount);
      setError(t.social.followError);
    } finally {
      setBusy(false);
    }
  }, [
    user,
    following,
    followerCount,
    garage,
    isOwner,
    canFollow,
    router,
    loginHref,
    notifyOwner,
    t.social.followError,
  ]);

  if (authLoading && !loaded) {
    return (
      <div className={cn("h-9 w-28 animate-pulse rounded-lg bg-white/5", className)} />
    );
  }

  if (isOwner) {
    return (
      <p className={cn("text-xs text-[#64748B]", className)}>
        {t.social.thisIsYourGarage}
      </p>
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
            {t.social.followBuild}
          </Button>
        ) : canFollow ? (
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
                {compact ? t.social.followingShort : t.social.following}
              </>
            ) : (
              <>
                <UserPlus className="size-3.5" />
                {t.social.followBuild}
              </>
            )}
          </Button>
        ) : null}
        <span className="text-xs text-[#94A3B8]">
          {followerCount.toLocaleString()} {t.social.followers}
        </span>
      </div>
      {error ? <p className="text-[10px] text-red-300">{error}</p> : null}
    </div>
  );
}
