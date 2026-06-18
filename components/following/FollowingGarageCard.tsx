"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

import { GarageFollowButton } from "@/components/garage/GarageFollowButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { buildStageLabel } from "@/lib/garage/labels";
import { carTitle } from "@/lib/garage/feed-generator";
import type { FollowingGarageCardData } from "@/lib/garage/feed-enrichment";
import { unfollowGarage } from "@/lib/repositories/garage-follows";

type FollowingGarageCardProps = {
  data: FollowingGarageCardData;
  onUnfollowed: () => void;
};

export function FollowingGarageCard({ data, onUnfollowed }: FollowingGarageCardProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const { garage, car } = data;
  const [busy, setBusy] = useState(false);
  const title = car ? carTitle(car) : garage.displayName;
  const activity = garage.lastActivityAt ?? garage.updatedAt ?? garage.createdAt;

  const unfollow = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    try {
      await unfollowGarage(user.uid, garage.id);
      onUnfollowed();
    } finally {
      setBusy(false);
    }
  }, [user, garage.id, onUnfollowed]);

  return (
    <article className="flex gap-3 rounded-xl border border-white/[0.08] bg-[#0B1118]/70 p-3">
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-[#151B24]">
        {car?.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={car.primaryImageUrl}
            alt={title}
            className="size-full object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[#F8FAFC]">{garage.displayName}</p>
        <p className="truncate text-xs text-[#94A3B8]">{title}</p>
        <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-[#64748B]">
          {car?.horsepower != null ? <span>{car.horsepower} hp</span> : null}
          {car?.buildStage ? (
            <span>{buildStageLabel(car.buildStage, t)}</span>
          ) : null}
          {garage.clubName ? <span>{garage.clubName}</span> : null}
        </div>
        <time className="mt-1 block text-[10px] text-[#64748B]">
          {new Date(activity).toLocaleDateString()}
        </time>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={`/garage/${garage.id}`}
            className="text-xs font-medium text-[#3B82F6] hover:underline"
          >
            {t.social.viewGarage}
          </Link>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            className="h-7 border-white/10 text-[10px]"
            onClick={() => void unfollow()}
          >
            {t.social.unfollow}
          </Button>
        </div>
      </div>
    </article>
  );
}
