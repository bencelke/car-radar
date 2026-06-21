import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { sanitizeFirestoreData } from "@/lib/firebase/sanitize-firestore";
import type {
  CorrectionRequest,
  CorrectionRequestStatus,
  CorrectionRequestTargetType,
  CorrectionRequestType,
} from "@/lib/types";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

export type CreateCorrectionRequestInput = {
  targetType: CorrectionRequestTargetType;
  targetId: string;
  targetName?: string | null;
  requestType: CorrectionRequestType;
  requesterUid?: string | null;
  requesterName?: string | null;
  requesterEmail?: string | null;
  message: string;
};

const mockRequests: CorrectionRequest[] = [];

function sortNewest(items: CorrectionRequest[]): CorrectionRequest[] {
  return [...items].sort((a, b) =>
    String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))
  );
}

function normalizeRequest(
  raw: Record<string, unknown>,
  id: string
): CorrectionRequest {
  return {
    id,
    targetType: raw.targetType as CorrectionRequestTargetType,
    targetId: String(raw.targetId ?? ""),
    targetName: (raw.targetName as string | null | undefined) ?? null,
    requestType: (raw.requestType as CorrectionRequestType) ?? "correction",
    requesterUid: (raw.requesterUid as string | null | undefined) ?? null,
    requesterName: (raw.requesterName as string | null | undefined) ?? null,
    requesterEmail: (raw.requesterEmail as string | null | undefined) ?? null,
    message: String(raw.message ?? ""),
    status: (raw.status as CorrectionRequestStatus) ?? "pending",
    reviewedByUid: (raw.reviewedByUid as string | null | undefined) ?? null,
    reviewedAt: raw.reviewedAt,
    reviewNote: (raw.reviewNote as string | null | undefined) ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function createCorrectionRequest(
  input: CreateCorrectionRequestInput
): Promise<{ id: string }> {
  const now = new Date().toISOString();
  const payload = sanitizeFirestoreData({
    targetType: input.targetType,
    targetId: input.targetId,
    targetName: input.targetName?.trim() || null,
    requestType: input.requestType,
    requesterUid: input.requesterUid ?? null,
    requesterName: input.requesterName?.trim() || null,
    requesterEmail: input.requesterEmail?.trim() || null,
    message: input.message.trim(),
    status: "pending" as CorrectionRequestStatus,
    createdAt: now,
    updatedAt: now,
  });

  if (!db) {
    const id = generateId("correction");
    mockRequests.unshift(normalizeRequest(payload, id));
    return { id };
  }

  try {
    const ref = await addDoc(
      collection(db, COLLECTIONS.correctionRequests),
      payload
    );
    return { id: ref.id };
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.correctionRequests, error);
    const id = generateId("correction");
    mockRequests.unshift(normalizeRequest(payload, id));
    return { id };
  }
}

export async function getPendingCorrectionRequests(): Promise<CorrectionRequest[]> {
  if (!db) {
    return sortNewest(mockRequests.filter((r) => r.status === "pending"));
  }

  try {
    const snap = await getDocs(
      query(
        collection(db, COLLECTIONS.correctionRequests),
        where("status", "==", "pending")
      )
    );
    return sortNewest(
      snap.docs.map((d) =>
        normalizeRequest(d.data() as Record<string, unknown>, d.id)
      )
    );
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.correctionRequests, error);
    return sortNewest(mockRequests.filter((r) => r.status === "pending"));
  }
}

export async function adminUpdateCorrectionRequestStatus(
  requestId: string,
  status: CorrectionRequestStatus,
  note: string | null,
  reviewedByUid: string
): Promise<void> {
  const now = new Date().toISOString();
  const patch = sanitizeFirestoreData({
    status,
    reviewNote: note?.trim() || null,
    reviewedByUid,
    reviewedAt: now,
    updatedAt: now,
  });

  if (!db) {
    const idx = mockRequests.findIndex((r) => r.id === requestId);
    if (idx >= 0) {
      mockRequests[idx] = { ...mockRequests[idx]!, ...patch };
    }
    return;
  }

  await updateDoc(doc(db, COLLECTIONS.correctionRequests, requestId), patch);
}
