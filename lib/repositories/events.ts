import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { getPublishedEvents } from "@/lib/mock-data/published-store";
import { mockEvents } from "@/lib/mock-data/seeds";
import type { CarEvent } from "@/lib/types";
import {
  filterApproved,
  logRepositoryFallback,
  sortFeaturedFirst,
} from "@/lib/repositories/utils";

function approvedEventsWithPublished(): CarEvent[] {
  return filterApproved([...getPublishedEvents(), ...mockEvents]);
}

async function fetchApprovedFromFirestore(): Promise<CarEvent[]> {
  if (!db) return approvedEventsWithPublished();

  const q = query(
    collection(db, COLLECTIONS.carEvents),
    where("status", "==", "approved")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as CarEvent
  );
}

export async function getApprovedEvents(): Promise<CarEvent[]> {
  try {
    const events = await fetchApprovedFromFirestore();
    return sortFeaturedFirst(
      events.length > 0 ? events : approvedEventsWithPublished()
    );
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

export async function getEventById(id: string): Promise<CarEvent | null> {
  const fromMock = approvedEventsWithPublished().find((e) => e.id === id);
  if (!db) return fromMock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.carEvents, id));
    if (!snap.exists()) return fromMock ?? null;
    const event = { id: snap.id, ...snap.data() } as CarEvent;
    return event.status === "approved" ? event : null;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.carEvents, error);
    return fromMock ?? null;
  }
}
