"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { PostCard } from "@/components/community/PostCard";
import { PostComposer } from "@/components/community/PostComposer";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getApprovedClubMembershipForUser } from "@/lib/repositories/club-members";
import {
  getPinnedPostsByContext,
  getPostsByContext,
} from "@/lib/repositories/posts";
import type { CarEvent, Club, ClubMember, CommunityPost } from "@/lib/types";

type ContextFeedProps = {
  contextType: "club" | "event";
  contextId: string;
  club?: Club | null;
  event?: CarEvent | null;
  officialOnly?: boolean;
  emptyMessage: string;
};

export function ContextFeed({
  contextType,
  contextId,
  club,
  event,
  officialOnly,
  emptyMessage,
}: ContextFeedProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [pinned, setPinned] = useState<CommunityPost[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [membership, setMembership] = useState<ClubMember | null>(null);

  const pinnedIds = useMemo(() => new Set(pinned.map((p) => p.id)), [pinned]);

  const load = useCallback(async () => {
    setLoading(true);
    const [pinnedPosts, feed] = await Promise.all([
      officialOnly ? Promise.resolve([]) : getPinnedPostsByContext(contextType, contextId),
      getPostsByContext(contextType, contextId, { officialOnly }),
    ]);
    setPinned(pinnedPosts);
    setPosts(
      feed.posts.filter((p) => !pinnedPosts.some((pin) => pin.id === p.id))
    );
    setLoading(false);
  }, [contextType, contextId, officialOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!user || contextType !== "club" || !club) {
      setMembership(null);
      return;
    }
    void getApprovedClubMembershipForUser(club.id, user.uid).then(setMembership);
  }, [user, contextType, club]);

  function handlePublished(post: CommunityPost) {
    if (post.isPinned) {
      setPinned((prev) => [post, ...prev]);
    } else if (officialOnly && !post.isOfficial) {
      return;
    } else {
      setPosts((prev) => [post, ...prev]);
    }
  }

  function handleUpdated(post: CommunityPost) {
    if (post.status !== "published") {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setPinned((prev) => prev.filter((p) => p.id !== post.id));
      return;
    }
    setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    setPinned((prev) => prev.map((p) => (p.id === post.id ? post : p)));
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const { posts: more } = await getPostsByContext(contextType, contextId, {
        pageSize: 15,
        officialOnly,
      });
      setPosts((prev) => {
        const seen = new Set([...prev, ...pinned].map((p) => p.id));
        return [
          ...prev,
          ...more.filter((p) => !seen.has(p.id) && !pinnedIds.has(p.id)),
        ];
      });
    } finally {
      setLoadingMore(false);
    }
  }

  const visiblePinned = officialOnly ? [] : pinned;
  const hasContent = visiblePinned.length > 0 || posts.length > 0;

  return (
    <div className="space-y-4">
      {!officialOnly ? (
        <PostComposer
          contextType={contextType}
          contextId={contextId}
          club={club}
          event={event}
          membership={membership}
          onPublished={handlePublished}
        />
      ) : null}

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-[#64748B]" />
        </div>
      ) : !hasContent ? (
        <p className="rounded-xl border border-white/[0.06] bg-[#151B24]/30 px-4 py-6 text-center text-sm text-[#64748B]">
          {emptyMessage}
        </p>
      ) : (
        <>
          {visiblePinned.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              club={club}
              event={event}
              onUpdated={handleUpdated}
            />
          ))}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              club={club}
              event={event}
              onUpdated={handleUpdated}
            />
          ))}
          <button
            type="button"
            disabled={loadingMore}
            onClick={() => void loadMore()}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-white/[0.08] text-sm text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-50"
          >
            {loadingMore ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t.communityPosts.loadMore
            )}
          </button>
        </>
      )}
    </div>
  );
}
