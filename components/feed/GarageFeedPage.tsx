"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { FeaturedGaragesSection } from "@/components/feed/FeaturedGaragesSection";
import { FeedEmptyState } from "@/components/feed/FeedEmptyState";
import { FeedFilterBar } from "@/components/feed/FeedFilterBar";
import { GarageFeedItemCard } from "@/components/feed/GarageFeedItemCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { enrichFeedItems } from "@/lib/garage/feed-enrichment";
import {
  filterFeedItems,
  type FeedFilterCategory,
} from "@/lib/garage/feed-generator";
import { getPrimaryCarByGarageId } from "@/lib/repositories/garage-cars";
import {
  getGarageFeedForUser,
  getPublicGarageFeed,
} from "@/lib/repositories/garage-feed";
import {
  getFeaturedGarages,
  getPopularGarages,
  getRecentlyUpdatedGarages,
} from "@/lib/repositories/garages";
import type { GarageCar, GarageFeedItem, GarageProfile } from "@/lib/types";

async function loadDiscoveryCards(garages: GarageProfile[]) {
  return Promise.all(
    garages.map(async (garage) => ({
      garage,
      car: await getPrimaryCarByGarageId(garage.id),
    }))
  );
}

export function GarageFeedPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FeedFilterCategory>("all");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<GarageFeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [enriched, setEnriched] = useState<
    Awaited<ReturnType<typeof enrichFeedItems>>
  >([]);
  const [discovery, setDiscovery] = useState<{
    featured: Array<{ garage: GarageProfile; car: GarageCar | null }>;
    recent: Array<{ garage: GarageProfile; car: GarageCar | null }>;
    popular: Array<{ garage: GarageProfile; car: GarageCar | null }>;
  }>({ featured: [], recent: [], popular: [] });

  const refreshEnriched = useCallback(async (nextItems: GarageFeedItem[]) => {
    setEnriched(await enrichFeedItems(nextItems));
  }, []);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    const page = user
      ? await getGarageFeedForUser(user.uid, 20)
      : await getPublicGarageFeed(20);
    setItems(page.items);
    setCursor(page.nextCursor);
    await refreshEnriched(page.items);

    const [featured, recent, popular] = await Promise.all([
      loadDiscoveryCards(await getFeaturedGarages(6)),
      loadDiscoveryCards(await getRecentlyUpdatedGarages(6)),
      loadDiscoveryCards(await getPopularGarages(6)),
    ]);
    setDiscovery({ featured, recent, popular });
    setLoading(false);
  }, [user, refreshEnriched]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    const page = user
      ? await getGarageFeedForUser(user.uid, 20, cursor)
      : await getPublicGarageFeed(20, cursor);
    const nextItems = [...items, ...page.items];
    setItems(nextItems);
    setCursor(page.nextCursor);
    await refreshEnriched(nextItems);
    setLoadingMore(false);
  }, [cursor, items, loadingMore, refreshEnriched, user]);

  const visible = useMemo(() => {
    const filtered = filterFeedItems(items, filter);
    const ids = new Set(filtered.map((i) => i.id));
    return enriched.filter((e) => ids.has(e.item.id));
  }, [items, filter, enriched]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#64748B]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-[#F8FAFC]">
          {t.social.activityFeed}
        </h1>
        <p className="mt-1 text-xs text-[#64748B]">
          {user ? t.social.personalizedFeed : t.social.publicFeed}
        </p>
      </div>

      <FeaturedGaragesSection {...discovery} />

      <FeedFilterBar value={filter} onChange={setFilter} />

      {visible.length === 0 ? (
        <FeedEmptyState signedIn={Boolean(user)} />
      ) : (
        <ul className="space-y-3">
          {visible.map((data) => (
            <li key={data.item.id}>
              <GarageFeedItemCard data={data} />
            </li>
          ))}
        </ul>
      )}

      {cursor ? (
        <Button
          type="button"
          variant="outline"
          disabled={loadingMore}
          className="w-full border-white/10"
          onClick={() => void loadMore()}
        >
          {loadingMore ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            t.social.loadMore
          )}
        </Button>
      ) : null}
    </div>
  );
}
