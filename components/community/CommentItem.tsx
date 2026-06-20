"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { CommentModerationMenu } from "@/components/community/CommentModerationMenu";
import { ReportDialog } from "@/components/community/ReportDialog";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { formatPostTime } from "@/lib/community/post-labels";
import type { PostComment } from "@/lib/types";

type CommentItemProps = {
  comment: PostComment;
  postId: string;
  contextType: "club" | "event";
  contextId: string;
  canModerate: boolean;
  onUpdated: (comment: PostComment) => void;
};

export function CommentItem({
  comment,
  postId,
  contextType,
  contextId,
  canModerate,
  onUpdated,
}: CommentItemProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (comment.status === "removed") {
    return (
      <li className="rounded-lg bg-[#151B24]/30 px-3 py-2 text-xs italic text-[#64748B]">
        {t.communityPosts.commentRemoved}
      </li>
    );
  }

  const isAuthor = user?.uid === comment.authorUid;

  return (
    <li className="flex gap-2 rounded-lg border border-white/[0.05] bg-[#151B24]/30 px-3 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#0B1118] text-xs font-semibold text-[#93C5FD]">
        {comment.authorDisplayName.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#E2E8F0]">
            {comment.authorDisplayName}
          </span>
          <span className="text-[10px] text-[#64748B]">
            {formatPostTime(comment.createdAt)}
          </span>
          {comment.editedAt ? (
            <span className="text-[10px] text-[#64748B]">
              {t.communityPosts.edited}
            </span>
          ) : null}
          {(isAuthor || canModerate) && (
            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex size-9 items-center justify-center rounded-md text-[#64748B] hover:text-[#CBD5E1]"
              >
                <MoreHorizontal className="size-3.5" />
              </button>
              {menuOpen ? (
                <CommentModerationMenu
                  comment={comment}
                  canModerate={canModerate}
                  isAuthor={isAuthor}
                  onClose={() => setMenuOpen(false)}
                  onUpdated={onUpdated}
                  onReport={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                  }}
                />
              ) : null}
            </div>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-[#CBD5E1]">
          {comment.body}
        </p>
      </div>
      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="comment"
        targetId={comment.id}
        postId={postId}
        contextType={contextType}
        contextId={contextId}
      />
    </li>
  );
}
