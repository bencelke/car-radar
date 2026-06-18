import { doc, getDoc, setDoc } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import { setMockShareAnalytics } from "@/lib/mock-data/share-store";
import type { ShareAnalyticsEvent } from "@/lib/types";
import type { TrackShareActionInput } from "@/lib/share/share-types";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

function sessionId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const key = "shiftit_share_session";
  let value = sessionStorage.getItem(key);
  if (!value) {
    value = generateId("sess");
    sessionStorage.setItem(key, value);
  }
  return value;
}

export async function trackShareAction(input: TrackShareActionInput): Promise<void> {
  const now = new Date().toISOString();
  const id = generateId("share_evt");
  const event: ShareAnalyticsEvent = {
    id,
    shareLinkId: input.shareLinkId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    userId: input.userId,
    sessionId: sessionId(),
    source: input.source,
    campaign: input.campaign,
    createdAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockShareAnalytics(event);
    return;
  }

  try {
    await setDoc(
      doc(db, COLLECTIONS.shareAnalytics, id),
      sanitizeFirestoreData(event as unknown as Record<string, unknown>)
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.shareAnalytics, error);
    setMockShareAnalytics(event);
  }
}

export async function incrementShareLinkClick(shareLinkId: string): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const ref = doc(db, COLLECTIONS.shareLinks, shareLinkId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const current = (snap.data().clickCount as number | undefined) ?? 0;
    await setDoc(ref, { clickCount: current + 1 }, { merge: true });
  } catch {
    /* non-blocking */
  }
}
