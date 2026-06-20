import { authedFetch } from "@/lib/client/authed-fetch";
import type { CarEvent, ClubAnnouncement } from "@/lib/types";

import type { EventUpdateField } from "./notification-types";

function logNotificationFailure(context: string, error: unknown): void {
  console.warn(`[ShiftIt] Notification trigger failed (${context})`, error);
}

async function runClientTrigger(body: Record<string, unknown>): Promise<void> {
  const res = await authedFetch("/api/notifications/trigger", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? `Trigger failed (${res.status})`);
  }
}

export function triggerClubAnnouncementPublished(
  announcement: ClubAnnouncement,
  _actorUid?: string
): void {
  void runClientTrigger({
    kind: "club_announcement",
    clubId: announcement.clubId,
    announcementId: announcement.id,
  }).catch((error) => logNotificationFailure("club_announcement", error));
}

export function triggerClubEventCreated(event: CarEvent, _actorUid?: string): void {
  if (!event.clubId || event.status !== "approved") return;

  void runClientTrigger({
    kind: "club_event_created",
    clubId: event.clubId,
    eventId: event.id,
  }).catch((error) => logNotificationFailure("club_event_created", error));
}

export function triggerEventUpdated(
  eventId: string,
  changedFields: EventUpdateField[],
  _actorUid?: string
): void {
  if (changedFields.length === 0) return;

  void runClientTrigger({
    kind: "event_updated",
    eventId,
    changedFields,
  }).catch((error) => logNotificationFailure("event_updated", error));
}

export function triggerEventCancelled(eventId: string, _actorUid?: string): void {
  void runClientTrigger({
    kind: "event_cancelled",
    eventId,
  }).catch((error) => logNotificationFailure("event_cancelled", error));
}

export function triggerPostComment(
  comment: import("@/lib/types").PostComment,
  post: import("@/lib/types").CommunityPost,
  actorUid: string
): void {
  void runClientTrigger({
    kind: "post_comment",
    postId: post.id,
    commentId: comment.id,
    actorUid,
  }).catch((error) => logNotificationFailure("post_comment", error));
}

export function triggerCommunityPostOfficial(
  post: import("@/lib/types").CommunityPost,
  actorUid: string
): void {
  if (!post.isOfficial) return;
  void runClientTrigger({
    kind: "community_post_official",
    postId: post.id,
    actorUid,
  }).catch((error) => logNotificationFailure("community_post_official", error));
}
