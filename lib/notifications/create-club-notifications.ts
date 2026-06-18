import { getClubFollowerUserIds } from "@/lib/repositories/club-follows";
import { getClubById } from "@/lib/repositories/clubs";
import { createNotificationsBatch } from "@/lib/server/notification-service";
import type { CarEvent, ClubAnnouncement } from "@/lib/types";
import { clubDetailPath, eventDetailPath } from "@/lib/utils/entity-paths";

import {
  buildNotificationDedupeKey,
  type CreateNotificationInput,
} from "./notification-types";

export async function notifyClubFollowersOfAnnouncement(
  clubId: string,
  announcement: ClubAnnouncement,
  actorUid?: string
): Promise<number> {
  const club = await getClubById(clubId);
  if (!club) return 0;

  const followerIds = await getClubFollowerUserIds(clubId);
  const recipients = followerIds.filter((uid) => uid !== actorUid);
  const actionUrl = clubDetailPath(club);

  const inputs: CreateNotificationInput[] = recipients.map((recipientUid) => ({
    recipientUid,
    type: "club_announcement",
    title: club.name,
    body: announcement.title,
    clubId,
    announcementId: announcement.id,
    actionUrl,
    dedupeKey: buildNotificationDedupeKey([
      "club_announcement",
      announcement.id,
      recipientUid,
    ]),
    metadata: {
      announcementType: announcement.type,
      clubName: club.name,
    },
  }));

  return createNotificationsBatch(inputs);
}

export async function notifyClubFollowersOfNewEvent(
  clubId: string,
  event: CarEvent,
  actorUid?: string
): Promise<number> {
  if (event.status !== "approved") return 0;

  const club = await getClubById(clubId);
  if (!club) return 0;

  const followerIds = await getClubFollowerUserIds(clubId);
  const recipients = followerIds.filter((uid) => uid !== actorUid);
  const actionUrl = eventDetailPath(event);

  const inputs: CreateNotificationInput[] = recipients.map((recipientUid) => ({
    recipientUid,
    type: "club_event_created",
    title: club.name,
    body: event.title,
    clubId,
    eventId: event.id,
    actionUrl,
    dedupeKey: buildNotificationDedupeKey([
      "club_event_created",
      event.id,
      recipientUid,
    ]),
    metadata: {
      clubName: club.name,
      eventTitle: event.title,
      startTime: event.startTime,
    },
  }));

  return createNotificationsBatch(inputs);
}
