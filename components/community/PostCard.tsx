"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pin,
} from "lucide-react";

import { CommentComposer } from "@/components/community/CommentComposer";
import { CommentList } from "@/components/community/CommentList";
import { PostModerationMenu } from "@/components/community/PostModerationMenu";
import { ReportDialog } from "@/components/community/ReportDialog";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  formatPostTime,
  officialBadgeLabel,
} from "@/lib/community/post-labels";
import { canModeratePost } from "@/lib/community/post-permissions";
import { hasUserLikedPost, togglePostLike } from "@/lib/repositories/post-reactions";
import type { CarEvent, Club, CommunityPost } from "@/lib/types";
import { formatInstagramHandle } from "@/lib/utils/instagram";
import { cn } from "@/lib/utils";

type PostCardProps = {
  post: CommunityPost;
  club?: Club | null;
  event?: CarEvent | null;
  onUpdated: (post: CommunityPost) => void;
};

export function PostCard({ post, club, event, onUpdated }: PostCardProps) {
  const { t } = useLocale();
  const { user, isAdmin } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.reactionCount);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [reportOpen, setReportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const officialLabel = officialBadgeLabel(post, t);
  const isCancellation = post.type === "announcement" && post.title?.toLowerCase().includes("cancel");
  const isRoute = post.type === "route_update";

  const borderClass = post.isOfficial
    ? isCancellation
      ? "border-red-500/30"
      : isRoute
        ? "border-amber-500/30"
        : "border-[#3B82F6]/30"
    : "border-white/[0.08]";

  useEffect(() => {
    if (!user) return;
    void hasUserLikedPost(post.id, user.uid).then(setLiked);
  }, [post.id, user]);

  async function handleLike() {
    if (!user) return;
    const result = await togglePostLike(post.id, user.uid);
    setLiked(result.liked);
    setLikeCount(result.reactionCount);
  }

  const canModerate = canModeratePost(
    post.contextType,
    club ?? null,
    event ?? null,
    user?.uid,
    isAdmin
  );

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-[#0B1118]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        borderClass
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#151B24] text-sm font-semibold text-[#93C5FD]">
          {post.authorDisplayName.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold text-[#F8FAFC]">
              {post.authorDisplayName}
            </span>
            {post.authorInstagramHandle ? (
              <span className="text-xs text-[#64748B]">
                {formatInstagramHandle(post.authorInstagramHandle)}
              </span>
            ) : null}
            <span className="text-xs text-[#64748B]">
              {formatPostTime(post.createdAt)}
            </span>
            {post.editedAt ? (
              <span className="text-[10px] text-[#64748B]">
                {t.communityPosts.edited}
              </span>
            ) : null}
            {post.isPinned ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#3B82F6]/15 px-2 py-0.5 text-[10px] font-medium text-[#93C5FD]">
                <Pin className="size-3" />
                {t.communityPosts.pinned}
              </span>
            ) : null}
            {officialLabel ? (
              <span className="rounded-full bg-[#3B82F6]/10 px-2 py-0.5 text-[10px] font-medium text-[#93C5FD]">
                {officialLabel}
              </span>
            ) : null}
          </div>
          {post.title ? (
            <h3 className="mt-2 font-heading text-base font-semibold text-[#F8FAFC]">
              {post.title}
            </h3>
          ) : null}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#CBD5E1]">
            {post.body}
          </p>
          {post.imageUrl ? (
            <div className="mt-3 overflow-hidden rounded-lg border border-white/[0.06]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt=""
                className="max-h-80 w-full object-cover"
              />
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleLike()}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition",
                liked
                  ? "text-[#FCA5A5]"
                  : "text-[#94A3B8] hover:text-[#F8FAFC]"
              )}
            >
              <Heart className={cn("size-4", liked && "fill-current")} />
              {liked ? t.communityPosts.unlike : t.communityPosts.like}
              {likeCount > 0 ? ` · ${likeCount}` : ""}
            </button>
            <button
              type="button"
              onClick={() => setShowComments((v) => !v)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#94A3B8] transition hover:text-[#F8FAFC]"
            >
              <MessageCircle className="size-4" />
              {t.communityPosts.comment}
              {commentCount > 0 ? ` · ${commentCount}` : ""}
            </button>
            <div className="relative ml-auto">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex size-11 items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#F8FAFC]"
                aria-label="More"
              >
                <MoreHorizontal className="size-4" />
              </button>
              {menuOpen ? (
                <PostModerationMenu
                  post={post}
                  club={club}
                  event={event}
                  canModerate={canModerate}
                  onClose={() => setMenuOpen(false)}
                  onUpdated={onUpdated}
                  onReport={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {showComments ? (
        <div className="border-t border-white/[0.06] bg-[#080C12]/50 p-4">
          <CommentComposer
            post={post}
            onCreated={() => setCommentCount((c) => c + 1)}
          />
          <CommentList
            postId={post.id}
            contextType={post.contextType === "event" ? "event" : "club"}
            contextId={post.contextId}
            canModerate={canModerate}
          />
        </div>
      ) : null}

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetId={post.id}
        postId={post.id}
        contextType={post.contextType}
        contextId={post.contextId}
      />
    </article>
  );
}
