import type { CommunityPost, PostComment } from "@/lib/types";

import {
  buildNotificationDedupeKey,
  type CreateNotificationInput,
} from "./notification-types";

export function buildPostCommentNotification(
  comment: PostComment,
  post: CommunityPost,
  actorUid: string
): CreateNotificationInput | null {
  if (post.authorUid === actorUid) return null;

  const actionUrl =
    post.contextType === "club"
      ? `/clubs/${post.contextId}`
      : post.contextType === "event"
        ? `/events/${post.contextId}`
        : undefined;

  return {
    recipientUid: post.authorUid,
    type: "post_comment",
    title: "New comment on your post",
    body: `${comment.authorDisplayName}: ${comment.body.slice(0, 120)}`,
    clubId: post.clubId,
    eventId: post.eventId,
    actionUrl,
    metadata: { postId: post.id, commentId: comment.id },
    dedupeKey: buildNotificationDedupeKey([
      "post_comment",
      post.id,
      comment.id,
    ]),
  };
}

export function buildOfficialPostNotifications(
  post: CommunityPost,
  followerUids: string[],
  actorUid: string
): CreateNotificationInput[] {
  if (!post.isOfficial) return [];

  const actionUrl =
    post.contextType === "club"
      ? `/clubs/${post.contextId}`
      : `/events/${post.contextId}`;

  return followerUids
    .filter((uid) => uid !== actorUid)
    .map((recipientUid) => ({
      recipientUid,
      type: "community_post_official" as const,
      title: post.title ?? "Official update",
      body: post.body.slice(0, 160),
      clubId: post.clubId,
      eventId: post.eventId,
      actionUrl,
      metadata: { postId: post.id },
      dedupeKey: buildNotificationDedupeKey([
        "community_post_official",
        post.id,
        recipientUid,
      ]),
    }));
}
