import { createHash } from "node:crypto";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { getAdminFirestore } from "@/lib/firebase/admin-server";
import {
  getMockNotifications,
  setMockNotification,
  updateMockNotification,
} from "@/lib/mock-data/community-store";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type AppNotification,
  type NotificationPreferences,
} from "@/lib/types";
import type { CreateNotificationInput } from "@/lib/notifications/notification-types";
import { preferenceKeyForType } from "@/lib/notifications/notification-types";

const BATCH_LIMIT = 400;

function notificationDocId(recipientUid: string, dedupeKey: string): string {
  const hash = createHash("sha256")
    .update(`${recipientUid}:${dedupeKey}`)
    .digest("hex")
    .slice(0, 32);
  return `${recipientUid}_${hash}`;
}

function toNotification(
  id: string,
  input: CreateNotificationInput
): AppNotification {
  const now = new Date().toISOString();
  return {
    id,
    recipientUid: input.recipientUid,
    type: input.type,
    title: input.title,
    body: input.body,
    status: "unread",
    clubId: input.clubId,
    eventId: input.eventId,
    announcementId: input.announcementId,
    memberId: input.memberId,
    actionUrl: input.actionUrl,
    metadata: { ...input.metadata, dedupeKey: input.dedupeKey },
    createdAt: now,
  };
}

async function loadUserPreferences(
  recipientUid: string
): Promise<NotificationPreferences> {
  const db = getAdminFirestore();
  if (!db) return DEFAULT_NOTIFICATION_PREFERENCES;

  try {
    const snap = await db.collection(COLLECTIONS.users).doc(recipientUid).get();
    if (!snap.exists) return DEFAULT_NOTIFICATION_PREFERENCES;
    const prefs = snap.data()?.notificationPreferences as
      | NotificationPreferences
      | undefined;
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...prefs };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

function isPreferenceEnabled(
  prefs: NotificationPreferences,
  type: CreateNotificationInput["type"]
): boolean {
  const key = preferenceKeyForType(type);
  if (!key) return true;
  return prefs[key] !== false;
}

async function bumpUserNotificationSummary(
  recipientUid: string,
  deltaUnread: number
): Promise<void> {
  const db = getAdminFirestore();
  if (!db || deltaUnread === 0) return;

  const ref = db.collection(COLLECTIONS.users).doc(recipientUid);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists ? (snap.data()?.unreadNotificationCount ?? 0) : 0;
    const next = Math.max(0, current + deltaUnread);
    tx.set(
      ref,
      {
        unreadNotificationCount: next,
        lastNotificationAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  });
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<AppNotification | null> {
  const prefs = await loadUserPreferences(input.recipientUid);
  if (!isPreferenceEnabled(prefs, input.type)) return null;

  const id = notificationDocId(input.recipientUid, input.dedupeKey);
  const db = getAdminFirestore();

  if (!db) {
    const existing = getMockNotifications().find((n) => n.id === id);
    if (existing) return existing;
    const created = toNotification(id, input);
    setMockNotification(created);
    return created;
  }

  const ref = db.collection(COLLECTIONS.notifications).doc(id);
  const snap = await ref.get();
  if (snap.exists) {
    return { id, ...snap.data() } as AppNotification;
  }

  const created = toNotification(id, input);
  await ref.set(created);
  await bumpUserNotificationSummary(input.recipientUid, 1);
  return created;
}

export async function createNotificationsBatch(
  inputs: CreateNotificationInput[]
): Promise<number> {
  if (inputs.length === 0) return 0;

  const db = getAdminFirestore();
  let created = 0;

  if (!db) {
    for (const input of inputs) {
      const result = await createNotification(input);
      if (result && result.status === "unread") created += 1;
    }
    return created;
  }

  for (let i = 0; i < inputs.length; i += BATCH_LIMIT) {
    const chunk = inputs.slice(i, i + BATCH_LIMIT);
    const batch = db.batch();
    const summaryDeltas = new Map<string, number>();
    let chunkCreated = 0;

    for (const input of chunk) {
      const prefs = await loadUserPreferences(input.recipientUid);
      if (!isPreferenceEnabled(prefs, input.type)) continue;

      const id = notificationDocId(input.recipientUid, input.dedupeKey);
      const ref = db.collection(COLLECTIONS.notifications).doc(id);
      const snap = await ref.get();
      if (snap.exists) continue;

      const notification = toNotification(id, input);
      batch.set(ref, notification);
      summaryDeltas.set(
        input.recipientUid,
        (summaryDeltas.get(input.recipientUid) ?? 0) + 1
      );
      chunkCreated += 1;
    }

    if (chunkCreated > 0) {
      await batch.commit();
      for (const [uid, delta] of summaryDeltas) {
        await bumpUserNotificationSummary(uid, delta);
      }
      created += chunkCreated;
    }
  }

  return created;
}
