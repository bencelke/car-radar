"use client";

import { Pin } from "lucide-react";

import { PostCard } from "@/components/community/PostCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { CarEvent, Club, CommunityPost } from "@/lib/types";

type PinnedPostsSectionProps = {
  posts: CommunityPost[];
  club?: Club | null;
  event?: CarEvent | null;
  onUpdated: (post: CommunityPost) => void;
};

export function PinnedPostsSection({
  posts,
  club,
  event,
  onUpdated,
}: PinnedPostsSectionProps) {
  const { t } = useLocale();

  if (posts.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Pin className="size-3.5 text-[#93C5FD]" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#93C5FD]">
          {t.communityPosts.pinned}
        </h3>
      </div>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          club={club}
          event={event}
          onUpdated={onUpdated}
        />
      ))}
    </section>
  );
}
