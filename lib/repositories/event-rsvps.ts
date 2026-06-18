import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { eventRsvpDocId } from "@/lib/clubs/club-auth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  deleteMockRsvp,
  getMockRsvps,
  setMockRsvp,
} from "@/lib/mock-data/community-store";
import type { EventRsvp, EventRsvpStatus } from "@/lib/types";
import { logRepositoryFallback } from "@/lib/repositories/utils";
import { RepositoryMutationError } from "@/lib/repositories/club-follows";
import { updateEventRsvpCounts } from "@/lib/repositories/events";

export type EventRsvpCounts = {
  going: number;
  interested: number;
  notGoing: number;
};

export async function getUserEventRsvp(
  eventId: string,
  userId: string
): Promise<EventRsvp | null> {
  const id = eventRsvpDocId(eventId, userId);
  if (!db) {
    return getMockRsvps().find((r) => r.id === id) ?? null;
  }
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.eventRsvps, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as EventRsvp;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.eventRsvps, error);
    return getMockRsvps().find((r) => r.id === id) ?? null;
  }
}

export async function getEventRsvpCounts(
  eventId: string
): Promise<EventRsvpCounts> {
  const rsvps = await getEventRsvps(eventId);
  return {
    going: rsvps.filter((r) => r.status === "going").length,
    interested: rsvps.filter((r) => r.status === "interested").length,
    notGoing: rsvps.filter((r) => r.status === "not_going").length,
  };
}

export async function getEventRsvps(eventId: string): Promise<EventRsvp[]> {
  if (!db) {
    return getMockRsvps().filter((r) => r.eventId === eventId);
  }
  try {
    const q = query(
      collection(db, COLLECTIONS.eventRsvps),
      where("eventId", "==", eventId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EventRsvp);
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.eventRsvps, error);
    return getMockRsvps().filter((r) => r.eventId === eventId);
  }
}

export async function setEventRsvp(
  eventId: string,
  userId: string,
  status: EventRsvpStatus
): Promise<EventRsvp> {
  const now = new Date().toISOString();
  const id = eventRsvpDocId(eventId, userId);
  const existing = await getUserEventRsvp(eventId, userId);
  const record: EventRsvp = {
    id,
    eventId,
    userId,
    status,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockRsvp(record);
    await updateEventRsvpCounts(eventId);
    return record;
  }

  await setDoc(
    doc(db, COLLECTIONS.eventRsvps, id),
    sanitizeFirestoreData(record as unknown as Record<string, unknown>)
  );
  await updateEventRsvpCounts(eventId);
  return record;
}

export async function removeEventRsvp(
  eventId: string,
  userId: string
): Promise<void> {
  const id = eventRsvpDocId(eventId, userId);

  if (!isFirebaseConfigured || !db) {
    deleteMockRsvp(id);
    await updateEventRsvpCounts(eventId);
    return;
  }

  await deleteDoc(doc(db, COLLECTIONS.eventRsvps, id));
  await updateEventRsvpCounts(eventId);
}
