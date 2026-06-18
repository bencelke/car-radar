import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import {
  getMockNotifications,
  updateMockNotification,
} from "@/lib/mock-data/community-store";
import type { AppNotification, NotificationStatus } from "@/lib/types";
import { logRepositoryFallback, isFirestorePermissionDenied } from "@/lib/repositories/utils";

const DEFAULT_LIMIT = 30;

function sortNotifications(items: AppNotification[]): AppNotification[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function userNotificationsQuery(userId: string, max: number) {
  if (!db) throw new Error("Firestore unavailable");
  return query(
    collection(db, COLLECTIONS.notifications),
    where("recipientUid", "==", userId),
    orderBy("createdAt", "desc"),
    limit(max)
  );
}

export async function getUserNotifications(
  userId: string,
  max = DEFAULT_LIMIT
): Promise<AppNotification[]> {
  const mock = sortNotifications(
    getMockNotifications().filter((n) => n.recipientUid === userId)
  ).slice(0, max);

  if (!db) return mock;

  try {
    const snap = await getDocs(userNotificationsQuery(userId, max));
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as AppNotification
    );
    return items;
  } catch (error) {
    if (isFirestorePermissionDenied(error)) {
      logRepositoryFallback(COLLECTIONS.notifications, error);
      return [];
    }
    logRepositoryFallback(COLLECTIONS.notifications, error);
    return mock;
  }
}

export async function getUnreadNotifications(
  userId: string,
  max = DEFAULT_LIMIT
): Promise<AppNotification[]> {
  const all = await getUserNotifications(userId, max * 2);
  return all.filter((n) => n.status === "unread").slice(0, max);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const mockCount = getMockNotifications().filter(
    (n) => n.recipientUid === userId && n.status === "unread"
  ).length;

  if (!db) return mockCount;

  try {
    const q = query(
      collection(db, COLLECTIONS.notifications),
      where("recipientUid", "==", userId),
      where("status", "==", "unread")
    );
    const snap = await getCountFromServer(q);
    return snap.data().count;
  } catch (error) {
    if (isFirestorePermissionDenied(error)) {
      logRepositoryFallback(COLLECTIONS.notifications, error);
      return 0;
    }
    logRepositoryFallback(COLLECTIONS.notifications, error);
    return mockCount;
  }
}

export function subscribeUserNotifications(
  userId: string,
  max: number,
  onChange: (notifications: AppNotification[], unreadCount: number) => void
): () => void {
  if (!db) {
    const refresh = () => {
      const items = sortNotifications(
        getMockNotifications().filter((n) => n.recipientUid === userId)
      ).slice(0, max);
      const unreadCount = items.filter((n) => n.status === "unread").length;
      onChange(items, unreadCount);
    };
    refresh();
    const id = window.setInterval(refresh, 5000);
    return () => window.clearInterval(id);
  }

  const q = userNotificationsQuery(userId, max);
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as AppNotification
      );
      const unreadCount = items.filter((n) => n.status === "unread").length;
      onChange(items, unreadCount);
    },
    (error) => {
      if (isFirestorePermissionDenied(error)) {
        logRepositoryFallback(COLLECTIONS.notifications, error);
        onChange([], 0);
        return;
      }
      logRepositoryFallback(COLLECTIONS.notifications, error);
      void getUserNotifications(userId, max).then((items) => {
        onChange(
          items,
          items.filter((n) => n.status === "unread").length
        );
      });
    }
  );
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<void> {
  const now = new Date().toISOString();

  if (!db) {
    updateMockNotification(notificationId, { status: "read", readAt: now });
    return;
  }

  await updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
    status: "read" satisfies NotificationStatus,
    readAt: now,
  });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const now = new Date().toISOString();

  if (!db) {
    for (const n of getMockNotifications()) {
      if (n.recipientUid === userId && n.status === "unread") {
        updateMockNotification(n.id, { status: "read", readAt: now });
      }
    }
    return;
  }

  const unread = await getUnreadNotifications(userId, 200);
  if (unread.length === 0) return;

  const batch = writeBatch(db);
  for (const n of unread) {
    batch.update(doc(db, COLLECTIONS.notifications, n.id), {
      status: "read",
      readAt: now,
    });
  }
  await batch.commit();
}

export async function archiveNotification(
  notificationId: string,
  userId: string
): Promise<void> {
  const now = new Date().toISOString();

  if (!db) {
    updateMockNotification(notificationId, {
      status: "archived",
      archivedAt: now,
    });
    return;
  }

  await updateDoc(doc(db, COLLECTIONS.notifications, notificationId), {
    status: "archived",
    archivedAt: now,
  });
}

/** Placeholder for future retention job — not implemented in V1. */
export async function deleteOldNotificationsForUser(_userId: string): Promise<void> {
  // Cloud Function / scheduled job: archive or delete notifications older than N days.
}
