import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  getMockClubEvents,
  getMockRsvps,
  setMockClubEvent,
} from "@/lib/mock-data/community-store";
import { getPublishedEvents } from "@/lib/mock-data/published-store";
import { mockEvents } from "@/lib/mock-data/seeds";
import type { CarEvent, EventStatus } from "@/lib/types";
import { RepositoryMutationError } from "@/lib/repositories/club-follows";
import {
  generateId,
  logRepositoryFallback,
  sortFeaturedFirst,
} from "@/lib/repositories/utils";
import { getEntitySlug, matchesSlugOrId, slugify } from "@/lib/utils/slug";
import {
  EVENT_UPDATE_FIELDS,
  type EventUpdateField,
} from "@/lib/notifications/notification-types";

const PUBLIC_EVENT_STATUSES: EventStatus[] = ["approved", "cancelled"];

function isPublicEvent(event: CarEvent): boolean {
  return PUBLIC_EVENT_STATUSES.includes(event.status);
}

function approvedEventsWithPublished(): CarEvent[] {
  const all = [...getPublishedEvents(), ...mockEvents, ...getMockClubEvents()];
  return all.filter((e) => isPublicEvent(e));
}

async function fetchPublicFromFirestore(): Promise<CarEvent[]> {
  if (!db) return approvedEventsWithPublished();

  const approvedQ = query(
    collection(db, COLLECTIONS.carEvents),
    where("status", "==", "approved")
  );
  const cancelledQ = query(
    collection(db, COLLECTIONS.carEvents),
    where("status", "==", "cancelled")
  );
  const [approvedSnap, cancelledSnap] = await Promise.all([
    getDocs(approvedQ),
    getDocs(cancelledQ),
  ]);
  const events = [...approvedSnap.docs, ...cancelledSnap.docs].map(
    (d) => ({ id: d.id, ...d.data() }) as CarEvent
  );
  return events;
}

export async function getApprovedEvents(): Promise<CarEvent[]> {
  try {
    const events = await fetchPublicFromFirestore();
    const merged = events.length > 0 ? events : approvedEventsWithPublished();
    return sortFeaturedFirst(merged.filter((e) => e.status === "approved"));
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.carEvents, error);
    return sortFeaturedFirst(
      approvedEventsWithPublished().filter((e) => e.status === "approved")
    );
  }
}

/** Approved + cancelled for public detail pages. */
export async function getPublicEvents(): Promise<CarEvent[]> {
  try {
    const events = await fetchPublicFromFirestore();
    const merged = events.length > 0 ? events : approvedEventsWithPublished();
    return sortFeaturedFirst(merged.filter(isPublicEvent));
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.carEvents, error);
    return sortFeaturedFirst(approvedEventsWithPublished());
  }
}

export async function getUpcomingEvents(): Promise<CarEvent[]> {
  const events = await getApprovedEvents();
  const now = Date.now();
  return events
    .filter((event) => new Date(event.startTime).getTime() >= now)
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
}

export async function getEventsByClubId(clubId: string): Promise<CarEvent[]> {
  const events = await getPublicEvents();
  return events
    .filter((e) => e.clubId === clubId)
    .sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
}

export async function getEventById(id: string): Promise<CarEvent | null> {
  const fromMock = approvedEventsWithPublished().find((e) => e.id === id);
  if (!db) return fromMock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.carEvents, id));
    if (!snap.exists()) return fromMock ?? null;
    const event = { id: snap.id, ...snap.data() } as CarEvent;
    return isPublicEvent(event) ? event : null;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.carEvents, error);
    return fromMock ?? null;
  }
}

export async function getEventRecord(id: string): Promise<CarEvent | null> {
  const fromMock = approvedEventsWithPublished().find((e) => e.id === id);
  if (!db) return fromMock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.carEvents, id));
    if (!snap.exists()) return fromMock ?? null;
    const event = { id: snap.id, ...snap.data() } as CarEvent;
    return isPublicEvent(event) ? event : null;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.carEvents, error);
    return fromMock ?? null;
  }
}

export async function getEventBySlug(slugOrId: string): Promise<CarEvent | null> {
  const events = await getPublicEvents();
  const match = events.find((event) => matchesSlugOrId(event, slugOrId));
  if (match) return match;
  return getEventRecord(slugOrId);
}

function detectEventChanges(
  before: CarEvent,
  after: CarEvent
): EventUpdateField[] {
  return EVENT_UPDATE_FIELDS.filter(
    (field) => before[field] !== after[field]
  );
}

async function emitEventNotificationSideEffects(
  before: CarEvent,
  after: CarEvent,
  actorUid?: string
): Promise<void> {
  const { triggerEventCancelled, triggerEventUpdated } = await import(
    "@/lib/notifications/triggers"
  );

  if (before.status !== "cancelled" && after.status === "cancelled") {
    triggerEventCancelled(after.id, actorUid);
    return;
  }

  const changedFields = detectEventChanges(before, after);
  if (changedFields.length > 0 && after.status !== "cancelled") {
    triggerEventUpdated(after.id, changedFields, actorUid);
  }
}

export type CreateClubEventInput = {
  clubId: string;
  clubName?: string;
  title: string;
  type: string;
  city: string;
  country: string;
  area?: string;
  address?: string;
  lat?: number;
  lng?: number;
  description: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  meetingRoute?: string;
  maxAttendance?: number;
  organizerName?: string;
  organizerInstagram?: string;
  imageUrl?: string;
  createdByUid?: string;
  status?: EventStatus;
};

export async function createClubEvent(
  input: CreateClubEventInput
): Promise<CarEvent> {
  const now = new Date().toISOString();
  const id = generateId("evt");
  const slug = slugify(input.title) || id;
  const event: CarEvent = {
    id,
    slug,
    clubId: input.clubId,
    clubName: input.clubName,
    title: input.title.trim(),
    type: input.type.trim() || "Meet",
    status: input.status ?? "approved",
    city: input.city.trim(),
    country: input.country.trim(),
    area: input.area,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
    description: input.description.trim(),
    startTime: input.startTime,
    endTime: input.endTime,
    timezone: input.timezone,
    meetingRoute: input.meetingRoute,
    maxAttendance: input.maxAttendance,
    organizerName: input.organizerName,
    organizerInstagram: input.organizerInstagram,
    imageUrl: input.imageUrl,
    verified: false,
    featured: false,
    interestedCount: 0,
    goingCount: 0,
    notGoingCount: 0,
    checkedInCount: 0,
    createdByUid: input.createdByUid,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockClubEvent(event);
    if (event.status === "approved" && event.clubId) {
      const { triggerClubEventCreated } = await import(
        "@/lib/notifications/triggers"
      );
      triggerClubEventCreated(event, input.createdByUid);
    }
    return event;
  }

  await setDoc(
    doc(db, COLLECTIONS.carEvents, id),
    sanitizeFirestoreData(event as unknown as Record<string, unknown>)
  );

  if (event.status === "approved" && event.clubId) {
    const { triggerClubEventCreated } = await import(
      "@/lib/notifications/triggers"
    );
    triggerClubEventCreated(event, input.createdByUid);
  }

  return event;
}

export async function updateClubEvent(
  id: string,
  patch: Partial<CarEvent>
): Promise<CarEvent> {
  const existing = await getEventById(id);
  if (!existing) {
    throw new RepositoryMutationError("Event not found.");
  }

  const updated: CarEvent = {
    ...existing,
    ...patch,
    id: existing.id,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    setMockClubEvent(updated);
    void emitEventNotificationSideEffects(
      existing,
      updated,
      patch.createdByUid ?? existing.createdByUid
    );
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.carEvents, id),
    sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
    { merge: true }
  );

  void emitEventNotificationSideEffects(
    existing,
    updated,
    patch.createdByUid ?? existing.createdByUid
  );

  return updated;
}

export async function cancelClubEvent(id: string): Promise<CarEvent> {
  return updateClubEvent(id, { status: "cancelled" });
}

/** Recalculate summary counts on the event doc (V1 — Cloud Functions can replace at scale). */
export async function updateEventRsvpCounts(eventId: string): Promise<void> {
  const rsvps = getMockRsvps().filter((r) => r.eventId === eventId);
  let going = 0;
  let interested = 0;
  let notGoing = 0;

  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, COLLECTIONS.eventRsvps),
        where("eventId", "==", eventId)
      );
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        const status = (d.data() as { status: string }).status;
        if (status === "going") going += 1;
        else if (status === "interested") interested += 1;
        else if (status === "not_going") notGoing += 1;
      }
    } catch {
      for (const r of rsvps) {
        if (r.status === "going") going += 1;
        else if (r.status === "interested") interested += 1;
        else if (r.status === "not_going") notGoing += 1;
      }
    }
  } else {
    for (const r of rsvps) {
      if (r.status === "going") going += 1;
      else if (r.status === "interested") interested += 1;
      else if (r.status === "not_going") notGoing += 1;
    }
  }

  const patch = {
    goingCount: going,
    interestedCount: interested,
    notGoingCount: notGoing,
    updatedAt: new Date().toISOString(),
  };

  const existing = await getEventById(eventId);
  if (!existing) return;

  if (!isFirebaseConfigured || !db) {
    setMockClubEvent({ ...existing, ...patch });
    return;
  }

  await setDoc(
    doc(db, COLLECTIONS.carEvents, eventId),
    sanitizeFirestoreData(patch),
    { merge: true }
  );
}

export { getEntitySlug };
