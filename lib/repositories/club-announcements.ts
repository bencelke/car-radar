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
  getMockAnnouncements,
  setMockAnnouncement,
} from "@/lib/mock-data/community-store";
import type { ClubAnnouncement } from "@/lib/types";
import {
  generateId,
  logRepositoryFallback,
} from "@/lib/repositories/utils";
import { RepositoryMutationError } from "@/lib/repositories/club-follows";

export type CreateClubAnnouncementInput = {
  clubId: string;
  authorUid: string;
  authorDisplayName?: string;
  title: string;
  body: string;
  type: ClubAnnouncement["type"];
  status?: ClubAnnouncement["status"];
  relatedEventId?: string;
};

export async function getPublishedAnnouncementsByClubId(
  clubId: string
): Promise<ClubAnnouncement[]> {
  const fromMock = getMockAnnouncements().filter(
    (a) => a.clubId === clubId && a.status === "published"
  );

  if (!db) {
    return fromMock.sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.createdAt).getTime() -
        new Date(a.publishedAt ?? a.createdAt).getTime()
    );
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.clubAnnouncements),
      where("clubId", "==", clubId),
      where("status", "==", "published")
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as ClubAnnouncement
    );
    const merged = items.length > 0 ? items : fromMock;
    return merged.sort(
      (a, b) =>
        new Date(b.publishedAt ?? b.createdAt).getTime() -
        new Date(a.publishedAt ?? a.createdAt).getTime()
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubAnnouncements, error);
    return fromMock;
  }
}

export async function getAnnouncementsByClubId(
  clubId: string
): Promise<ClubAnnouncement[]> {
  const fromMock = getMockAnnouncements().filter((a) => a.clubId === clubId);

  if (!db) return fromMock;

  try {
    const q = query(
      collection(db, COLLECTIONS.clubAnnouncements),
      where("clubId", "==", clubId)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as ClubAnnouncement
    );
    return items.length > 0 ? items : fromMock;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.clubAnnouncements, error);
    return fromMock;
  }
}

export async function createClubAnnouncement(
  input: CreateClubAnnouncementInput
): Promise<ClubAnnouncement> {
  const now = new Date().toISOString();
  const status = input.status ?? "published";
  const id = generateId("ann");
  const announcement: ClubAnnouncement = {
    id,
    clubId: input.clubId,
    authorUid: input.authorUid,
    authorDisplayName: input.authorDisplayName,
    title: input.title.trim(),
    body: input.body.trim(),
    type: input.type,
    status,
    relatedEventId: input.relatedEventId,
    publishedAt: status === "published" ? now : undefined,
    createdAt: now,
    updatedAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockAnnouncement(announcement);
    if (status === "published") {
      const { triggerClubAnnouncementPublished } = await import(
        "@/lib/notifications/triggers"
      );
      triggerClubAnnouncementPublished(announcement, input.authorUid);
    }
    return announcement;
  }

  await setDoc(
    doc(db, COLLECTIONS.clubAnnouncements, id),
    sanitizeFirestoreData(announcement as unknown as Record<string, unknown>)
  );

  if (status === "published") {
    const { triggerClubAnnouncementPublished } = await import(
      "@/lib/notifications/triggers"
    );
    triggerClubAnnouncementPublished(announcement, input.authorUid);
  }

  return announcement;
}

export async function updateClubAnnouncement(
  id: string,
  patch: Partial<
    Pick<
      ClubAnnouncement,
      "title" | "body" | "type" | "status" | "relatedEventId" | "publishedAt"
    >
  >
): Promise<ClubAnnouncement> {
  const now = new Date().toISOString();
  const existing =
    getMockAnnouncements().find((a) => a.id === id) ??
    (db
      ? ((await getDoc(doc(db, COLLECTIONS.clubAnnouncements, id))).exists()
          ? ({
              id,
              ...((
                await getDoc(doc(db, COLLECTIONS.clubAnnouncements, id))
              ).data() as Omit<ClubAnnouncement, "id">),
            } as ClubAnnouncement)
          : null)
      : null);

  if (!existing) {
    throw new RepositoryMutationError("Announcement not found.");
  }

  const updated: ClubAnnouncement = {
    ...existing,
    ...patch,
    updatedAt: now,
    publishedAt:
      patch.status === "published" && !existing.publishedAt
        ? now
        : (patch.publishedAt ?? existing.publishedAt),
  };

  if (!isFirebaseConfigured || !db) {
    setMockAnnouncement(updated);
    if (
      updated.status === "published" &&
      existing.status !== "published"
    ) {
      const { triggerClubAnnouncementPublished } = await import(
        "@/lib/notifications/triggers"
      );
      triggerClubAnnouncementPublished(updated, existing.authorUid);
    }
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.clubAnnouncements, id),
    sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
    { merge: true }
  );

  if (
    updated.status === "published" &&
    existing.status !== "published"
  ) {
    const { triggerClubAnnouncementPublished } = await import(
      "@/lib/notifications/triggers"
    );
    triggerClubAnnouncementPublished(updated, existing.authorUid);
  }

  return updated;
}

export async function archiveClubAnnouncement(id: string): Promise<void> {
  await updateClubAnnouncement(id, { status: "archived" });
}
