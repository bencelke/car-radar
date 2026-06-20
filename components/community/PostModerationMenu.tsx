"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  deleteOwnPost,
  moderatePost,
  setPostPinned,
} from "@/lib/repositories/posts";
import type { CarEvent, Club, CommunityPost } from "@/lib/types";
import { cn } from "@/lib/utils";

type PostModerationMenuProps = {
  post: CommunityPost;
  club?: Club | null;
  event?: CarEvent | null;
  canModerate: boolean;
  onClose: () => void;
  onUpdated: (post: CommunityPost) => void;
  onReport: () => void;
};

export function PostModerationMenu({
  post,
  club,
  event,
  canModerate,
  onClose,
  onUpdated,
  onReport,
}: PostModerationMenuProps) {
  const { t } = useLocale();
  const { user, isAdmin } = useAuth();
  const isAuthor = user?.uid === post.authorUid;

  async function run(action: () => Promise<CommunityPost>) {
    const updated = await action();
    onUpdated(updated);
    onClose();
  }

  const itemClass =
    "block w-full rounded-md px-3 py-2.5 text-left text-xs text-[#CBD5E1] hover:bg-white/[0.06]";

  return (
    <div
      className={cn(
        "absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-lg border border-white/[0.08] bg-[#0B1118] p-1 shadow-xl"
      )}
    >
      {canModerate ? (
        <button
          type="button"
          className={itemClass}
          onClick={() =>
            void run(() =>
              setPostPinned(
                post.id,
                !post.isPinned,
                {
                  uid: user!.uid,
                  displayName: user!.displayName ?? "Moderator",
                  isGlobalAdmin: isAdmin,
                },
                { club, event }
              )
            )
          }
        >
          {post.isPinned ? t.communityPosts.unpinPost : t.communityPosts.pinPost}
        </button>
      ) : null}
      {isAuthor ? (
        <button
          type="button"
          className={itemClass}
          onClick={() =>
            void run(() =>
              deleteOwnPost(post.id, {
                uid: user!.uid,
                displayName: user!.displayName ?? "Author",
                isGlobalAdmin: isAdmin,
              })
            )
          }
        >
          {t.communityPosts.deletePost}
        </button>
      ) : null}
      {canModerate && !isAuthor ? (
        <button
          type="button"
          className={itemClass}
          onClick={() =>
            void run(() =>
              moderatePost(
                post.id,
                "remove",
                {
                  uid: user!.uid,
                  displayName: user!.displayName ?? "Moderator",
                  isGlobalAdmin: isAdmin,
                },
                { club, event }
              )
            )
          }
        >
          {t.communityPosts.removePost}
        </button>
      ) : null}
      <button type="button" className={itemClass} onClick={onReport}>
        {t.communityPosts.reportPost}
      </button>
    </div>
  );
}
