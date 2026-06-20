"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import type { QueryDocumentSnapshot } from "firebase/firestore";

import { ClubPostsRail } from "@/components/community/ClubPostsRail";
import { EmptyPostsState } from "@/components/community/EmptyPostsState";
import { PinnedPostsSection } from "@/components/community/PinnedPostsSection";
import { PostCard } from "@/components/community/PostCard";
import { PostComposer } from "@/components/community/PostComposer";
import { PostingPermissionCard } from "@/components/community/PostingPermissionCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { resolveClubPostAccess } from "@/lib/community/can-post-to-club";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { getApprovedClubMembershipForUser } from "@/lib/repositories/club-members";
import {
  getPinnedPostsByContext,
  getPostsByContext,
} from "@/lib/repositories/posts";
import type { CarEvent, Club, ClubMember, CommunityPost, PostType } from "@/lib/types";
import { cn } from "@/lib/utils";

type PostSort = "latest" | "pinned";
type PostFilter = "all" | "official" | "question" | "meet_photo";

type ClubPostsPanelProps = {
  club: Club;
  members: ClubMember[];
  events: CarEvent[];
  followerCount?: number;
  coverSrc?: string;
  onClubUpdate: (club: Club) => void;
  onCoverSaved: (url: string) => void;
};

function PostFeedSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-36 animate-pulse rounded-2xl border border-white/[0.06] bg-[#151B24]/40"
        />
      ))}
    </div>
  );
}

function ComposerSkeleton() {
  return (
    <div className="h-14 animate-pulse rounded-2xl border border-white/[0.06] bg-[#151B24]/40" />
  );
}

export function ClubPostsPanel({
  club,
  members,
  events,
  followerCount = 0,
  coverSrc,
  onClubUpdate,
  onCoverSaved,
}: ClubPostsPanelProps) {
  const { t } = useLocale();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const returnPath = `/clubs/${club.slug}?tab=posts`;

  const [pinned, setPinned] = useState<CommunityPost[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot | null>(null);
  const [membership, setMembership] = useState<ClubMember | null>(null);
  const [membershipLoaded, setMembershipLoaded] = useState(false);
  const [sort, setSort] = useState<PostSort>("latest");
  const [filter, setFilter] = useState<PostFilter>("all");
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [composerType, setComposerType] = useState<PostType>("discussion");

  const access = useMemo(
    () =>
      resolveClubPostAccess({
        club,
        uid: user?.uid,
        isGlobalAdmin: isAdmin,
        membership,
        firebaseAvailable: isFirebaseConfigured,
      }),
    [club, user?.uid, isAdmin, membership]
  );

  const pinnedIds = useMemo(() => new Set(pinned.map((p) => p.id)), [pinned]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [pinnedPosts, feed] = await Promise.all([
        getPinnedPostsByContext("club", club.id),
        getPostsByContext("club", club.id),
      ]);
      setPinned(pinnedPosts);
      setPosts(feed.posts.filter((p) => !pinnedPosts.some((pin) => pin.id === p.id)));
      setCursor(feed.cursor);
      setHasMore(Boolean(feed.cursor) || feed.posts.length >= 15);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [club.id]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!user) {
      setMembership(null);
      setMembershipLoaded(true);
      return;
    }
    setMembershipLoaded(false);
    void getApprovedClubMembershipForUser(club.id, user.uid).then((m) => {
      setMembership(m);
      setMembershipLoaded(true);
    });
  }, [user, club.id]);

  function handlePublished(post: CommunityPost) {
    if (post.isPinned) {
      setPinned((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
    } else {
      setPosts((prev) => [post, ...prev.filter((p) => p.id !== post.id)]);
    }
    setComposerExpanded(false);
    setComposerType("discussion");
  }

  function handleUpdated(post: CommunityPost) {
    if (post.status !== "published") {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      setPinned((prev) => prev.filter((p) => p.id !== post.id));
      return;
    }
    if (post.isPinned) {
      setPinned((prev) => {
        const next = prev.map((p) => (p.id === post.id ? post : p));
        if (!next.some((p) => p.id === post.id)) return [post, ...next];
        return next;
      });
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    } else {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
      setPinned((prev) => prev.filter((p) => p.id !== post.id));
    }
  }

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const { posts: more, cursor: nextCursor } = await getPostsByContext("club", club.id, {
        pageSize: 15,
        cursor,
      });
      setCursor(nextCursor);
      setHasMore(Boolean(nextCursor));
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

  function matchesFilter(post: CommunityPost): boolean {
    if (filter === "official") return post.isOfficial;
    if (filter === "question") return post.type === "question";
    if (filter === "meet_photo") return post.type === "meet_photo";
    return true;
  }

  const filteredPinned = pinned.filter(matchesFilter);
  const filteredPosts = posts.filter(matchesFilter);
  const totalPostCount = pinned.length + posts.length;
  const hasContent = filteredPinned.length > 0 || filteredPosts.length > 0;
  const showComposerSlot = !authLoading && membershipLoaded;

  function handleQuickStart(type: PostType) {
    setComposerType(type);
    setComposerExpanded(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const feedColumn = (
    <div className="min-w-0 space-y-4">
      <header className="space-y-2 px-0.5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">
              {t.communityPosts.clubPostsTitle}
            </h2>
            <p className="mt-1 text-sm text-[#94A3B8]">
              {t.communityPosts.clubPostsHint}
            </p>
          </div>
          {totalPostCount > 0 || members.length > 0 ? (
            <p className="text-xs text-[#64748B]">
              {members.length > 0
                ? `${members.length.toLocaleString()} ${t.members.title.toLowerCase()}`
                : null}
              {members.length > 0 && totalPostCount > 0 ? " · " : null}
              {totalPostCount > 0
                ? `${totalPostCount.toLocaleString()} ${t.communityPosts.posts.toLowerCase()}`
                : null}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border border-white/[0.08] bg-[#151B24]/40 p-0.5">
            {(["latest", "pinned"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition",
                  sort === key
                    ? "bg-[#3B82F6]/20 text-[#F8FAFC]"
                    : "text-[#64748B] hover:text-[#CBD5E1]"
                )}
              >
                {key === "latest"
                  ? t.communityPosts.sortLatest
                  : t.communityPosts.sortPinned}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                ["all", t.communityPosts.filterAll],
                ["official", t.communityPosts.filterOfficial],
                ["question", t.communityPosts.postTypes.question],
                ["meet_photo", t.communityPosts.postTypes.meet_photo],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                  filter === key
                    ? "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#F8FAFC]"
                    : "border-white/[0.06] text-[#64748B] hover:text-[#CBD5E1]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {showComposerSlot ? (
        access.allowed ? (
          <PostComposer
            contextType="club"
            contextId={club.id}
            club={club}
            membership={membership}
            clubName={club.name}
            defaultExpanded={composerExpanded}
            defaultType={composerType}
            onExpandedChange={setComposerExpanded}
            onPublished={handlePublished}
          />
        ) : (
          <PostingPermissionCard
            access={access}
            clubSlug={club.slug}
            clubId={club.id}
            followerCount={followerCount}
            returnPath={returnPath}
          />
        )
      ) : (
        <ComposerSkeleton />
      )}

      {access.betaOpenPosting && access.allowed && !access.isMember ? (
        <p className="text-[10px] text-[#64748B]">{t.communityPosts.betaPostingNote}</p>
      ) : null}

      {loadError ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center">
          <p className="text-sm text-[#FCA5A5]">{t.communityPosts.loadError}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/[0.1] px-4 text-sm text-[#CBD5E1] hover:text-[#F8FAFC]"
          >
            <RefreshCw className="size-4" />
            {t.communityPosts.tryAgain}
          </button>
        </div>
      ) : loading ? (
        <PostFeedSkeleton />
      ) : (
        <>
          {sort === "pinned" || filteredPinned.length > 0 ? (
            <PinnedPostsSection
              posts={sort === "pinned" ? filteredPinned : filteredPinned}
              club={club}
              onUpdated={handleUpdated}
            />
          ) : null}

          {sort === "latest"
            ? filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  club={club}
                  onUpdated={handleUpdated}
                />
              ))
            : null}

          {!hasContent ? (
            <EmptyPostsState
              canPost={access.allowed}
              onQuickStart={handleQuickStart}
            />
          ) : null}

          {hasContent && hasMore && sort === "latest" ? (
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => void loadMore()}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/[0.08] text-sm text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                t.communityPosts.loadMore
              )}
            </button>
          ) : null}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,720px)_minmax(280px,300px)] lg:items-start lg:gap-6 xl:gap-8">
      <div className="order-2 lg:order-1">{feedColumn}</div>
      <ClubPostsRail
        className="order-1 lg:order-2"
        club={club}
        followerCount={followerCount}
        memberCount={members.length}
        postCount={totalPostCount}
        events={events}
        returnPath={returnPath}
        coverSrc={coverSrc}
        onClubUpdate={onClubUpdate}
        onCoverSaved={onCoverSaved}
      />
    </div>
  );
}
