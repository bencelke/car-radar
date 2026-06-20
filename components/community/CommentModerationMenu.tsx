"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  deleteOwnComment,
  moderateComment,
} from "@/lib/repositories/post-comments";
import type { PostComment } from "@/lib/types";
import { cn } from "@/lib/utils";

type CommentModerationMenuProps = {
  comment: PostComment;
  canModerate: boolean;
  isAuthor: boolean;
  onClose: () => void;
  onUpdated: (comment: PostComment) => void;
  onReport: () => void;
};

export function CommentModerationMenu({
  comment,
  canModerate,
  isAuthor,
  onClose,
  onUpdated,
  onReport,
}: CommentModerationMenuProps) {
  const { t } = useLocale();
  const { user, isAdmin } = useAuth();

  const itemClass =
    "block w-full rounded-md px-3 py-2.5 text-left text-xs text-[#CBD5E1] hover:bg-white/[0.06]";

  async function run(action: () => Promise<PostComment>) {
    const updated = await action();
    onUpdated(updated);
    onClose();
  }

  return (
    <div
      className={cn(
        "absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-lg border border-white/[0.08] bg-[#0B1118] p-1 shadow-xl"
      )}
    >
      {isAuthor ? (
        <button
          type="button"
          className={itemClass}
          onClick={() =>
            void run(() =>
              deleteOwnComment(comment.id, {
                uid: user!.uid,
                displayName: user!.displayName ?? "Author",
                isGlobalAdmin: isAdmin,
              })
            )
          }
        >
          {t.communityPosts.deleteComment}
        </button>
      ) : null}
      {canModerate && !isAuthor ? (
        <button
          type="button"
          className={itemClass}
          onClick={() =>
            void run(() =>
              moderateComment(
                comment.id,
                "remove",
                {
                  uid: user!.uid,
                  displayName: user!.displayName ?? "Moderator",
                  isGlobalAdmin: isAdmin,
                },
                { isModerator: true }
              )
            )
          }
        >
          {t.communityPosts.removeComment}
        </button>
      ) : null}
      <button type="button" className={itemClass} onClick={onReport}>
        {t.communityPosts.reportComment}
      </button>
    </div>
  );
}
