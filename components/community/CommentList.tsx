"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { CommentItem } from "@/components/community/CommentItem";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getCommentsByPostId } from "@/lib/repositories/post-comments";
import type { PostComment } from "@/lib/types";

type CommentListProps = {
  postId: string;
  contextType: "club" | "event";
  contextId: string;
  canModerate: boolean;
  initialLimit?: number;
};

export function CommentList({
  postId,
  contextType,
  contextId,
  canModerate,
  initialLimit = 3,
}: CommentListProps) {
  const { t } = useLocale();
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void getCommentsByPostId(postId).then(({ comments: items }) => {
      if (active) {
        setComments(items);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="size-5 animate-spin text-[#64748B]" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <p className="py-3 text-xs text-[#64748B]">{t.communityPosts.noCommentsYet}</p>
    );
  }

  const visible = showAll ? comments : comments.slice(0, initialLimit);
  const hasMore = comments.length > initialLimit;

  return (
    <>
      <ul className="mt-3 space-y-3">
        {visible.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            postId={postId}
            contextType={contextType}
            contextId={contextId}
            canModerate={canModerate}
            onUpdated={(updated) =>
              setComments((prev) =>
                prev.map((c) => (c.id === updated.id ? updated : c))
              )
            }
          />
        ))}
      </ul>
      {hasMore && !showAll ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-2 text-xs font-medium text-[#93C5FD] hover:text-[#BFDBFE]"
        >
          {t.communityPosts.viewAllComments}
        </button>
      ) : null}
    </>
  );
}
