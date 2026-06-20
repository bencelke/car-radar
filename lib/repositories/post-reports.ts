import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import {
  getMockPostReports,
  setMockPostReport,
} from "@/lib/mock-data/community-store";
import type {
  PostReport,
  PostReportReason,
  PostReportTargetType,
} from "@/lib/types";
import { RepositoryMutationError } from "@/lib/repositories/club-follows";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

export type CreatePostReportInput = {
  targetType: PostReportTargetType;
  targetId: string;
  postId?: string;
  contextType?: PostReport["contextType"];
  contextId?: string;
  reason: PostReportReason;
  details?: string;
};

export async function createPostReport(
  input: CreatePostReportInput,
  reporterUid: string
): Promise<PostReport> {
  if (!reporterUid) {
    throw new RepositoryMutationError("Sign in to report content.");
  }

  const existingPending = getMockPostReports().find(
    (r) =>
      r.reporterUid === reporterUid &&
      r.targetId === input.targetId &&
      r.status === "pending"
  );

  if (!db && existingPending) {
    return existingPending;
  }

  if (db) {
    try {
      const q = query(
        collection(db, COLLECTIONS.postReports),
        where("reporterUid", "==", reporterUid),
        where("targetId", "==", input.targetId),
        where("status", "==", "pending"),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0]!;
        return { id: docSnap.id, ...docSnap.data() } as PostReport;
      }
    } catch (error) {
      logRepositoryFallback(COLLECTIONS.postReports, error);
    }
  }

  const now = new Date().toISOString();
  const id = generateId("rpt");
  const report: PostReport = {
    id,
    targetType: input.targetType,
    targetId: input.targetId,
    postId: input.postId,
    contextType: input.contextType,
    contextId: input.contextId,
    reporterUid,
    reason: input.reason,
    details: input.details?.trim() || undefined,
    status: "pending",
    createdAt: now,
  };

  if (!isFirebaseConfigured || !db) {
    setMockPostReport(report);
    return report;
  }

  await setDoc(
    doc(db, COLLECTIONS.postReports, id),
    sanitizeFirestoreData(report as unknown as Record<string, unknown>)
  );
  return report;
}

export async function getPendingReports(): Promise<PostReport[]> {
  const fromMock = getMockPostReports()
    .filter((r) => r.status === "pending")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  if (!db) return fromMock;

  try {
    const q = query(
      collection(db, COLLECTIONS.postReports),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as PostReport
    );
    return items.length > 0 ? items : fromMock;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.postReports, error);
    return fromMock;
  }
}

export async function reviewReport(
  reportId: string,
  action: "dismiss" | "actioned",
  adminUid: string,
  actionTaken?: string
): Promise<PostReport> {
  const fromMock = getMockPostReports().find((r) => r.id === reportId);
  let existing = fromMock ?? null;

  if (db) {
    const snap = await getDoc(doc(db, COLLECTIONS.postReports, reportId));
    if (snap.exists()) {
      existing = { id: snap.id, ...snap.data() } as PostReport;
    }
  }

  if (!existing) throw new RepositoryMutationError("Report not found.");

  const now = new Date().toISOString();
  const updated: PostReport = {
    ...existing,
    status: action === "dismiss" ? "dismissed" : "actioned",
    reviewedAt: now,
    reviewedByUid: adminUid,
    actionTaken,
  };

  if (!isFirebaseConfigured || !db) {
    setMockPostReport(updated);
    return updated;
  }

  await setDoc(
    doc(db, COLLECTIONS.postReports, reportId),
    sanitizeFirestoreData(updated as unknown as Record<string, unknown>),
    { merge: true }
  );
  return updated;
}
