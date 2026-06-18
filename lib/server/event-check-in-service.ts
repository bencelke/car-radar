import type { CarEvent, Club, EventCheckIn } from "@/lib/types";
import {
  canManageClub,
  eventCheckInDocId,
} from "@/lib/clubs/club-auth";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getAdminFirestore } from "@/lib/firebase/admin-server";
import {
  buildCheckInUrl,
  checkInTokenExpiresAt,
  generateCheckInToken,
  hashCheckInToken,
  isCheckInTokenExpired,
} from "@/lib/events/check-in-token";
import {
  getMockCheckIns,
  getMockClubEvents,
  setMockCheckIn,
  setMockClubEvent,
} from "@/lib/mock-data/community-store";
import { getClubById } from "@/lib/repositories/clubs";
import { getUserProfile } from "@/lib/repositories/users";

export class CheckInError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "CheckInError";
  }
}

async function loadEvent(eventId: string): Promise<CarEvent | null> {
  const { getEventRecord } = await import("@/lib/repositories/events");
  return getEventRecord(eventId);
}

async function loadClub(clubId: string | undefined): Promise<Club | null> {
  if (!clubId) return null;
  return getClubById(clubId);
}

async function isGlobalAdmin(uid: string): Promise<boolean> {
  const profile = await getUserProfile(uid);
  if (!profile.profile) return false;
  return (
    profile.profile.role === "admin" || profile.profile.isAdmin === true
  );
}

export async function assertCanManageEvent(
  actorUid: string,
  event: CarEvent
): Promise<void> {
  const admin = await isGlobalAdmin(actorUid);
  if (admin) return;
  if (!event.clubId) {
    throw new CheckInError("forbidden", "Event has no club manager.");
  }
  const club = await loadClub(event.clubId);
  if (!club || !canManageClub(club, actorUid, false)) {
    throw new CheckInError("forbidden", "Not authorized to manage this event.");
  }
}

function assertEventAllowsCheckIn(event: CarEvent): void {
  if (event.status === "cancelled" || event.status === "archived") {
    throw new CheckInError("event_cancelled", "Event is not accepting check-ins.");
  }
}

async function persistEventPatch(
  eventId: string,
  patch: Partial<CarEvent>
): Promise<void> {
  const db = getAdminFirestore();
  if (db) {
    await db
      .collection(COLLECTIONS.carEvents)
      .doc(eventId)
      .set(
        { ...patch, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    return;
  }

  const existing =
    getMockClubEvents().find((e) => e.id === eventId) ??
    (await loadEvent(eventId));
  if (!existing) throw new CheckInError("not_found", "Event not found.");
  setMockClubEvent({ ...existing, ...patch, id: eventId });
}

export async function openEventCheckInSession(
  eventId: string,
  actorUid: string,
  origin: string
): Promise<{
  token: string;
  expiresAt: string;
  checkInUrl: string;
  checkedInCount: number;
}> {
  const event = await loadEvent(eventId);
  if (!event) throw new CheckInError("not_found", "Event not found.");
  await assertCanManageEvent(actorUid, event);
  assertEventAllowsCheckIn(event);

  const token = generateCheckInToken();
  const expiresAt = checkInTokenExpiresAt();
  const slug = event.slug ?? event.id;

  const openedAt = new Date().toISOString();

  await persistEventPatch(eventId, {
    checkInEnabled: true,
    checkInStatus: "open",
    checkInTokenHash: hashCheckInToken(token),
    checkInTokenExpiresAt: expiresAt,
    checkInOpenedAt: openedAt,
    checkInOpenedByUid: actorUid,
    checkInClosedAt: undefined,
  });

  const { notifyEventParticipantsCheckInOpen } = await import(
    "@/lib/notifications/create-event-notifications"
  );
  void notifyEventParticipantsCheckInOpen(eventId, actorUid, openedAt).catch(
    (error) => console.warn("[ShiftIt] Check-in notification failed", error)
  );

  return {
    token,
    expiresAt,
    checkInUrl: buildCheckInUrl(origin, slug, token),
    checkedInCount: event.checkedInCount ?? 0,
  };
}

export async function closeEventCheckInSession(
  eventId: string,
  actorUid: string
): Promise<void> {
  const event = await loadEvent(eventId);
  if (!event) throw new CheckInError("not_found", "Event not found.");
  await assertCanManageEvent(actorUid, event);

  await persistEventPatch(eventId, {
    checkInStatus: "closed",
    checkInClosedAt: new Date().toISOString(),
    checkInTokenHash: undefined,
    checkInTokenExpiresAt: undefined,
  });
}

function validateActiveToken(event: CarEvent, token: string): void {
  if (event.checkInStatus !== "open") {
    throw new CheckInError("check_in_closed", "Check-in is closed.");
  }
  if (isCheckInTokenExpired(event.checkInTokenExpiresAt)) {
    throw new CheckInError("token_expired", "Check-in code expired.");
  }
  const hash = hashCheckInToken(token);
  if (!event.checkInTokenHash || event.checkInTokenHash !== hash) {
    throw new CheckInError("invalid_token", "Invalid check-in code.");
  }
}

export type CheckInUserSnapshot = {
  displayName?: string;
  avatarUrl?: string;
  clubName?: string;
  memberProfileId?: string;
};

async function writeCheckInTransaction(
  eventId: string,
  userId: string,
  method: EventCheckIn["method"],
  snapshots: CheckInUserSnapshot,
  checkedInByUid?: string
): Promise<EventCheckIn> {
  const docId = eventCheckInDocId(eventId, userId);
  const now = new Date().toISOString();
  const db = getAdminFirestore();

  if (db) {
    const eventRef = db.collection(COLLECTIONS.carEvents).doc(eventId);
    const checkInRef = db.collection(COLLECTIONS.eventCheckins).doc(docId);

    return db.runTransaction(async (tx) => {
      const eventSnap = await tx.get(eventRef);
      if (!eventSnap.exists) throw new CheckInError("not_found", "Event not found.");
      const event = { id: eventSnap.id, ...eventSnap.data() } as CarEvent;

      const existingSnap = await tx.get(checkInRef);
      if (existingSnap.exists) {
        const existing = existingSnap.data() as EventCheckIn;
        if (existing.status === "checked_in") {
          throw new CheckInError("already_checked_in", "Already checked in.");
        }
      }

      const record: EventCheckIn = {
        id: docId,
        eventId,
        userId,
        memberProfileId: snapshots.memberProfileId,
        status: "checked_in",
        method,
        checkedInAt: now,
        checkedInByUid,
        displayNameSnapshot: snapshots.displayName,
        avatarUrlSnapshot: snapshots.avatarUrl,
        clubNameSnapshot: snapshots.clubName,
      };

      tx.set(checkInRef, record);
      tx.set(
        eventRef,
        {
          checkedInCount: (event.checkedInCount ?? 0) + 1,
          updatedAt: now,
        },
        { merge: true }
      );
      return record;
    });
  }

  const event = await loadEvent(eventId);
  if (!event) throw new CheckInError("not_found", "Event not found.");
  const existing = getMockCheckIns().find((c) => c.id === docId);
  if (existing?.status === "checked_in") {
    throw new CheckInError("already_checked_in", "Already checked in.");
  }

  const record: EventCheckIn = {
    id: docId,
    eventId,
    userId,
    memberProfileId: snapshots.memberProfileId,
    status: "checked_in",
    method,
    checkedInAt: now,
    checkedInByUid,
    displayNameSnapshot: snapshots.displayName,
    avatarUrlSnapshot: snapshots.avatarUrl,
    clubNameSnapshot: snapshots.clubName,
  };
  setMockCheckIn(record);
  setMockClubEvent({
    ...event,
    checkedInCount: (event.checkedInCount ?? 0) + 1,
  });
  return record;
}

export async function verifyTokenAndCheckIn(
  eventId: string,
  token: string,
  userId: string,
  snapshots: CheckInUserSnapshot
): Promise<EventCheckIn> {
  const event = await loadEvent(eventId);
  if (!event) throw new CheckInError("not_found", "Event not found.");
  assertEventAllowsCheckIn(event);
  validateActiveToken(event, token);
  return writeCheckInTransaction(eventId, userId, "qr", snapshots);
}

export async function manualOrganizerCheckIn(
  eventId: string,
  targetUserId: string,
  actorUid: string,
  snapshots: CheckInUserSnapshot
): Promise<EventCheckIn> {
  const event = await loadEvent(eventId);
  if (!event) throw new CheckInError("not_found", "Event not found.");
  await assertCanManageEvent(actorUid, event);
  assertEventAllowsCheckIn(event);
  if (event.checkInStatus !== "open") {
    throw new CheckInError("check_in_closed", "Open check-in first.");
  }
  return writeCheckInTransaction(
    eventId,
    targetUserId,
    "organizer_manual",
    snapshots,
    actorUid
  );
}

export async function removeEventCheckInRecord(
  eventId: string,
  targetUserId: string,
  actorUid: string
): Promise<void> {
  const event = await loadEvent(eventId);
  if (!event) throw new CheckInError("not_found", "Event not found.");
  await assertCanManageEvent(actorUid, event);

  const docId = eventCheckInDocId(eventId, targetUserId);
  const now = new Date().toISOString();
  const db = getAdminFirestore();

  if (db) {
    const eventRef = db.collection(COLLECTIONS.carEvents).doc(eventId);
    const checkInRef = db.collection(COLLECTIONS.eventCheckins).doc(docId);

    await db.runTransaction(async (tx) => {
      const checkInSnap = await tx.get(checkInRef);
      if (!checkInSnap.exists) return;
      const existing = checkInSnap.data() as EventCheckIn;
      if (existing.status !== "checked_in") {
        tx.set(checkInRef, { status: "removed", removedAt: now }, { merge: true });
        return;
      }
      const eventSnap = await tx.get(eventRef);
      const count = eventSnap.exists
        ? ((eventSnap.data()?.checkedInCount as number) ?? 0)
        : 0;
      tx.set(
        checkInRef,
        { status: "removed", removedAt: now },
        { merge: true }
      );
      tx.set(
        eventRef,
        {
          checkedInCount: Math.max(0, count - 1),
          updatedAt: now,
        },
        { merge: true }
      );
    });
    return;
  }

  const existing = getMockCheckIns().find((c) => c.id === docId);
  if (!existing || existing.status !== "checked_in") {
    if (existing) {
      setMockCheckIn({ ...existing, status: "removed", removedAt: now });
    }
    return;
  }
  setMockCheckIn({ ...existing, status: "removed", removedAt: now });
  const fresh = await loadEvent(eventId);
  if (fresh) {
    setMockClubEvent({
      ...fresh,
      checkedInCount: Math.max(0, (fresh.checkedInCount ?? 0) - 1),
    });
  }
}

export async function listEventCheckInsForOrganizer(
  eventId: string,
  actorUid: string
): Promise<EventCheckIn[]> {
  const event = await loadEvent(eventId);
  if (!event) throw new CheckInError("not_found", "Event not found.");
  await assertCanManageEvent(actorUid, event);

  const db = getAdminFirestore();
  if (db) {
    const snap = await db
      .collection(COLLECTIONS.eventCheckins)
      .where("eventId", "==", eventId)
      .where("status", "==", "checked_in")
      .get();
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as EventCheckIn);
  }

  return getMockCheckIns().filter(
    (c) => c.eventId === eventId && c.status === "checked_in"
  );
}

export async function getUserCheckInRecord(
  eventId: string,
  userId: string
): Promise<EventCheckIn | null> {
  const docId = eventCheckInDocId(eventId, userId);
  const db = getAdminFirestore();
  if (db) {
    const snap = await db.collection(COLLECTIONS.eventCheckins).doc(docId).get();
    if (!snap.exists) return null;
    const data = snap.data() as EventCheckIn;
    return data.status === "checked_in" ? data : null;
  }
  const mock = getMockCheckIns().find((c) => c.id === docId);
  return mock?.status === "checked_in" ? mock : null;
}

export async function buildUserSnapshot(
  userId: string,
  event: CarEvent
): Promise<CheckInUserSnapshot> {
  const { profile } = await getUserProfile(userId);
  return {
    displayName: profile?.displayName ?? profile?.email,
    avatarUrl: profile?.avatarUrl ?? profile?.photoURL ?? profile?.imageUrl,
    clubName: event.clubName,
  };
}

export function checkInErrorMessage(code: string, fallback: string): string {
  return code || fallback;
}
