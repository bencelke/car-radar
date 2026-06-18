import { getEventRsvps } from "@/lib/repositories/event-rsvps";
import { getEventRecord } from "@/lib/repositories/events";
import { createNotificationsBatch } from "@/lib/server/notification-service";
import type { CarEvent } from "@/lib/types";
import { eventDetailPath } from "@/lib/utils/entity-paths";

import {
  buildNotificationDedupeKey,
  type CreateNotificationInput,
  type EventUpdateField,
} from "./notification-types";

function formatFieldLabel(field: EventUpdateField): string {
  switch (field) {
    case "startTime":
      return "date/time";
    case "endTime":
      return "end time";
    case "meetingRoute":
      return "meeting route";
    case "address":
      return "address";
    case "city":
      return "city";
    case "country":
      return "country";
    case "area":
      return "area";
    default:
      return field;
  }
}

async function rsvpRecipientIds(
  eventId: string,
  statuses: Array<"going" | "interested">,
  actorUid?: string
): Promise<string[]> {
  const rsvps = await getEventRsvps(eventId);
  return [
    ...new Set(
      rsvps
        .filter((r) => statuses.includes(r.status as "going" | "interested"))
        .map((r) => r.userId)
        .filter((uid) => uid !== actorUid)
    ),
  ];
}

export async function notifyEventParticipantsOfUpdate(
  eventId: string,
  changedFields: EventUpdateField[],
  actorUid?: string
): Promise<number> {
  if (changedFields.length === 0) return 0;

  const event = await getEventRecord(eventId);
  if (!event || event.status === "cancelled") return 0;

  const recipients = await rsvpRecipientIds(eventId, ["going", "interested"], actorUid);
  if (recipients.length === 0) return 0;

  const labels = changedFields.map(formatFieldLabel);
  const body =
    labels.length === 1
      ? `${event.title}: ${labels[0]} changed.`
      : `${event.title}: ${labels.join(", ")} updated.`;
  const actionUrl = eventDetailPath(event);
  const version = event.updatedAt ?? new Date().toISOString();

  const inputs: CreateNotificationInput[] = recipients.map((recipientUid) => ({
    recipientUid,
    type: "event_updated",
    title: event.title,
    body,
    clubId: event.clubId,
    eventId: event.id,
    actionUrl,
    dedupeKey: buildNotificationDedupeKey([
      "event_updated",
      event.id,
      recipientUid,
      version,
    ]),
    metadata: {
      changedFields,
      eventTitle: event.title,
    },
  }));

  return createNotificationsBatch(inputs);
}

export async function notifyEventParticipantsOfCancellation(
  eventId: string,
  actorUid?: string
): Promise<number> {
  const event = await getEventRecord(eventId);
  if (!event) return 0;

  const recipients = await rsvpRecipientIds(eventId, ["going", "interested"], actorUid);
  if (recipients.length === 0) return 0;

  const actionUrl = eventDetailPath(event);

  const inputs: CreateNotificationInput[] = recipients.map((recipientUid) => ({
    recipientUid,
    type: "event_cancelled",
    title: event.title,
    body: `${event.title} has been cancelled.`,
    clubId: event.clubId,
    eventId: event.id,
    actionUrl,
    dedupeKey: buildNotificationDedupeKey([
      "event_cancelled",
      event.id,
      recipientUid,
    ]),
    metadata: {
      eventTitle: event.title,
    },
  }));

  return createNotificationsBatch(inputs);
}

export async function notifyEventParticipantsCheckInOpen(
  eventId: string,
  actorUid?: string,
  openedAtOverride?: string
): Promise<number> {
  const event = await getEventRecord(eventId);
  if (!event) return 0;

  const openedAt = openedAtOverride ?? event.checkInOpenedAt ?? new Date().toISOString();

  const recipients = await rsvpRecipientIds(eventId, ["going"], actorUid);
  if (recipients.length === 0) return 0;

  const actionUrl = eventDetailPath(event);

  const inputs: CreateNotificationInput[] = recipients.map((recipientUid) => ({
    recipientUid,
    type: "event_checkin_open",
    title: event.title,
    body: `Check-in is open for ${event.title}.`,
    clubId: event.clubId,
    eventId: event.id,
    actionUrl,
    dedupeKey: buildNotificationDedupeKey([
      "event_checkin_open",
      event.id,
      recipientUid,
      openedAt,
    ]),
    metadata: {
      eventTitle: event.title,
      checkInOpenedAt: openedAt,
    },
  }));

  return createNotificationsBatch(inputs);
}
