import { NextResponse } from "next/server";

import { assertCanManageEvent } from "@/lib/server/event-check-in-service";
import {
  getAdminFirestore,
  verifyIdTokenFromHeader,
} from "@/lib/firebase/admin-server";
import { notifyClubFollowersOfAnnouncement, notifyClubFollowersOfNewEvent } from "@/lib/notifications/create-club-notifications";
import {
  notifyEventParticipantsOfCancellation,
  notifyEventParticipantsOfUpdate,
} from "@/lib/notifications/create-event-notifications";
import { EVENT_UPDATE_FIELDS, type EventUpdateField } from "@/lib/notifications/notification-types";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getAnnouncementsByClubId } from "@/lib/repositories/club-announcements";
import type { ClubAnnouncement } from "@/lib/types";
import { canManageClub } from "@/lib/clubs/club-auth";
import { getClubById } from "@/lib/repositories/clubs";
import { getEventRecord } from "@/lib/repositories/events";
import { getUserProfile, isProfileAdmin } from "@/lib/repositories/users";

export const runtime = "nodejs";

type TriggerBody =
  | { kind: "club_announcement"; clubId: string; announcementId: string }
  | { kind: "club_event_created"; clubId: string; eventId: string }
  | { kind: "event_updated"; eventId: string; changedFields: EventUpdateField[] }
  | { kind: "event_cancelled"; eventId: string };

async function getClubAnnouncementForTrigger(
  clubId: string,
  announcementId: string
): Promise<ClubAnnouncement | null> {
  const adminDb = getAdminFirestore();
  if (adminDb) {
    const snap = await adminDb
      .collection(COLLECTIONS.clubAnnouncements)
      .doc(announcementId)
      .get();
    if (!snap.exists) return null;
    const announcement = { id: snap.id, ...snap.data() } as ClubAnnouncement;
    return announcement.clubId === clubId ? announcement : null;
  }

  const announcements = await getAnnouncementsByClubId(clubId);
  return announcements.find((a) => a.id === announcementId) ?? null;
}

async function assertClubManager(actorUid: string, clubId: string): Promise<void> {
  const club = await getClubById(clubId);
  if (!club) {
    throw new Error("Club not found.");
  }
  const { profile } = await getUserProfile(actorUid);
  if (!canManageClub(club, actorUid, isProfileAdmin(profile))) {
    throw new Error("Not authorized.");
  }
}

export async function POST(request: Request) {
  const actorUid = await verifyIdTokenFromHeader(request);
  if (!actorUid) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: TriggerBody;
  try {
    body = (await request.json()) as TriggerBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    switch (body.kind) {
      case "club_announcement": {
        await assertClubManager(actorUid, body.clubId);
        const announcement = await getClubAnnouncementForTrigger(
          body.clubId,
          body.announcementId
        );
        if (!announcement || announcement.status !== "published") {
          return NextResponse.json({ error: "not_found" }, { status: 404 });
        }
        const count = await notifyClubFollowersOfAnnouncement(
          body.clubId,
          announcement,
          actorUid
        );
        return NextResponse.json({ ok: true, count });
      }
      case "club_event_created": {
        await assertClubManager(actorUid, body.clubId);
        const event = await getEventRecord(body.eventId);
        if (!event || event.clubId !== body.clubId) {
          return NextResponse.json({ error: "not_found" }, { status: 404 });
        }
        const count = await notifyClubFollowersOfNewEvent(
          body.clubId,
          event,
          actorUid
        );
        return NextResponse.json({ ok: true, count });
      }
      case "event_updated": {
        const event = await getEventRecord(body.eventId);
        if (!event) {
          return NextResponse.json({ error: "not_found" }, { status: 404 });
        }
        await assertCanManageEvent(actorUid, event);
        const fields = body.changedFields.filter((f): f is EventUpdateField =>
          EVENT_UPDATE_FIELDS.includes(f as EventUpdateField)
        );
        const count = await notifyEventParticipantsOfUpdate(
          body.eventId,
          fields,
          actorUid
        );
        return NextResponse.json({ ok: true, count });
      }
      case "event_cancelled": {
        const event = await getEventRecord(body.eventId);
        if (!event) {
          return NextResponse.json({ error: "not_found" }, { status: 404 });
        }
        await assertCanManageEvent(actorUid, event);
        const count = await notifyEventParticipantsOfCancellation(
          body.eventId,
          actorUid
        );
        return NextResponse.json({ ok: true, count });
      }
      default:
        return NextResponse.json({ error: "unknown_kind" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json({ error: "forbidden", message }, { status: 403 });
  }
}
