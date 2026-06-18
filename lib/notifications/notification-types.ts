import type { NotificationType } from "@/lib/types";

export type CreateNotificationInput = {
  recipientUid: string;
  type: NotificationType;
  title: string;
  body: string;
  clubId?: string;
  eventId?: string;
  announcementId?: string;
  memberId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  dedupeKey: string;
};

export const EVENT_UPDATE_FIELDS = [
  "startTime",
  "endTime",
  "address",
  "city",
  "country",
  "area",
  "meetingRoute",
] as const;

export type EventUpdateField = (typeof EVENT_UPDATE_FIELDS)[number];

export function buildNotificationDedupeKey(parts: string[]): string {
  return parts.filter(Boolean).join(":");
}

export function preferenceKeyForType(
  type: NotificationType
): keyof import("@/lib/types").NotificationPreferences | null {
  switch (type) {
    case "club_announcement":
      return "clubAnnouncements";
    case "club_event_created":
      return "clubEvents";
    case "event_updated":
      return "eventUpdates";
    case "event_cancelled":
      return "eventCancellations";
    case "event_checkin_open":
      return "checkInAlerts";
    default:
      return null;
  }
}
