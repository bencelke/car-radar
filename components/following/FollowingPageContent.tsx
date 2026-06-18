"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { FollowingGarageCard } from "@/components/following/FollowingGarageCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { loadFollowingGarageCards } from "@/lib/garage/feed-enrichment";
import { getFollowedClubIds } from "@/lib/repositories/club-follows";
import {
  getFollowerCount,
  getFollowingGarages,
} from "@/lib/repositories/garage-follows";
import { getGarageByOwnerUid } from "@/lib/repositories/garages";

type TabId = "following" | "followers" | "clubs";

export function FollowingPageContent() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>("following");
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Awaited<ReturnType<typeof loadFollowingGarageCards>>>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [clubCount, setClubCount] = useState(0);
  const [ownGarageId, setOwnGarageId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [garages, ownGarage, clubIds] = await Promise.all([
      getFollowingGarages(user.uid),
      getGarageByOwnerUid(user.uid),
      getFollowedClubIds(user.uid),
    ]);
    setOwnGarageId(ownGarage?.id ?? null);
    setClubCount(clubIds.length);
    if (ownGarage) {
      setFollowerCount(await getFollowerCount(ownGarage.id));
    }
    setCards(await loadFollowingGarageCards(garages));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "following", label: t.social.followingBuilds },
    ...(ownGarageId
      ? [{ id: "followers" as const, label: t.social.followers }]
      : []),
    { id: "clubs", label: t.nav.clubs },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#64748B]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <h1 className="font-heading text-xl font-bold text-[#F8FAFC]">
        {t.social.followingBuilds}
      </h1>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
              tab === id
                ? "bg-[#3B82F6]/20 text-[#F8FAFC]"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "following" ? (
        cards.length === 0 ? (
          <div className="rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-6 text-center">
            <p className="text-sm font-medium text-[#F8FAFC]">
              {t.social.noFollowedBuilds}
            </p>
            <p className="mt-2 text-xs text-[#94A3B8]">{t.social.noFollowedHint}</p>
            <Link
              href="/feed"
              className="mt-4 inline-block text-sm text-[#3B82F6] hover:underline"
            >
              {t.social.activityFeed}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {cards.map((data) => (
              <li key={data.garage.id}>
                <FollowingGarageCard data={data} onUnfollowed={() => void load()} />
              </li>
            ))}
          </ul>
        )
      ) : null}

      {tab === "followers" ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-6">
          <p className="text-3xl font-bold text-[#F8FAFC]">
            {followerCount.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-[#94A3B8]">{t.social.followers}</p>
          <p className="mt-3 text-xs text-[#64748B]">{t.social.followersPrivateNote}</p>
        </div>
      ) : null}

      {tab === "clubs" ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-6">
          <p className="text-sm text-[#94A3B8]">
            {clubCount} {t.social.followingBuilds.toLowerCase()} · {t.nav.clubs}
          </p>
          <Link
            href="/clubs"
            className="mt-3 inline-block text-sm text-[#3B82F6] hover:underline"
          >
            {t.nav.clubs}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
