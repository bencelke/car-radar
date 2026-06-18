import { doc, getDoc } from "firebase/firestore";

import { eventCheckInDocId } from "@/lib/clubs/club-auth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { getMockCheckIns } from "@/lib/mock-data/community-store";
import { getEventById } from "@/lib/repositories/events";
import type { CheckInStatus, EventCheckIn } from "@/lib/types";
import { logRepositoryFallback } from "@/lib/repositories/utils";

export type EventCheckInSessionStatus = {
  checkInEnabled?: boolean;
  checkInStatus?: CheckInStatus;
  checkedInCount?: number;
  checkInOpenedAt?: string;
  checkInClosedAt?: string;
};

export async function getEventCheckInStatus(
  eventId: string
): Promise<EventCheckInSessionStatus | null> {
  const event = await getEventById(eventId);
  if (!event) return null;
  return {
    checkInEnabled: event.checkInEnabled,
    checkInStatus: event.checkInStatus,
    checkedInCount: event.checkedInCount,
    checkInOpenedAt: event.checkInOpenedAt,
    checkInClosedAt: event.checkInClosedAt,
  };
}

export async function getEventCheckedInCount(eventId: string): Promise<number> {
  const event = await getEventById(eventId);
  return event?.checkedInCount ?? 0;
}

export async function getUserEventCheckIn(
  eventId: string,
  userId: string
): Promise<EventCheckIn | null> {
  const id = eventCheckInDocId(eventId, userId);
  if (!db) {
    const mock = getMockCheckIns().find((c) => c.id === id);
    return mock?.status === "checked_in" ? mock : null;
  }
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.eventCheckins, id));
    if (!snap.exists()) return null;
    const data = { id: snap.id, ...snap.data() } as EventCheckIn;
    return data.status === "checked_in" ? data : null;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.eventCheckins, error);
    const mock = getMockCheckIns().find((c) => c.id === id);
    return mock?.status === "checked_in" ? mock : null;
  }
}

export async function getEventCheckInsViaApi(
  eventId: string
): Promise<EventCheckIn[]> {
  const { authedFetch } = await import("@/lib/client/authed-fetch");
  const res = await authedFetch(`/api/events/${eventId}/check-in/attendees`);
  if (!res.ok) return [];
  const data = (await res.json()) as { attendees?: EventCheckIn[] };
  return data.attendees ?? [];
}
