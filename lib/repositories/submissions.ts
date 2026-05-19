import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import {
  addPublishedClub,
  addPublishedEvent,
  addPublishedMember,
  addPublishedShop,
  getPublishedClubs,
} from "@/lib/mock-data/published-store";
import {
  addMockSubmission,
  getMockSubmissions,
  getMockSubmissionsByStatus,
  updateMockSubmissionReview,
} from "@/lib/mock-data/submission-store";
import { mockClubs } from "@/lib/mock-data/seeds";
import type {
  CarEvent,
  CarShop,
  Club,
  ClubMember,
  CreateSubmissionInput,
  Submission,
  SubmissionStatus,
} from "@/lib/types";
import type { PublishDraft } from "@/lib/repositories/publish-draft";
import {
  applyDraftToSubmission,
  mapPublishDraftToPublicEntity,
} from "@/lib/repositories/publish-draft";
import {
  canPublishSubmission,
  generatePublishedEntityId,
  isCorrectionOnlyApproval,
  mapSubmissionToPublicEntity,
  resolveClubIdForMember,
  type PublishedCollectionSlug,
} from "@/lib/repositories/submission-publish";
import {
  type RawSubmissionInput,
  sanitizeSubmissionInput,
} from "@/lib/repositories/submission-sanitize";
import { logRepositoryFallback } from "@/lib/repositories/utils";

export type { RawSubmissionInput };

export type SubmissionStatusFilter = SubmissionStatus | "all";

export type PublishResult = {
  success: boolean;
  published: boolean;
  approvedEntityId?: string;
  publishedCollection?: PublishedCollectionSlug;
};

function sortByNewest(items: Submission[]): Submission[] {
  return [...items].sort((a, b) =>
    (b.createdAt ?? "").localeCompare(a.createdAt ?? "")
  );
}

function mapFirestoreSubmissions(
  snapshot: Awaited<ReturnType<typeof getDocs>>
): Submission[] {
  return snapshot.docs.map((d) => {
    const data = d.data() as Omit<Submission, "id">;
    return { id: d.id, ...data };
  });
}

function devWarn(message: string, ...args: unknown[]) {
  if (process.env.NODE_ENV === "development") {
    console.warn(message, ...args);
  }
}

function findMockSubmission(id: string): Submission | undefined {
  return getMockSubmissions().find((s) => s.id === id);
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  const fromMock = findMockSubmission(id);
  if (!db) return fromMock ?? null;

  try {
    const snap = await getDoc(doc(db, COLLECTIONS.submissions, id));
    if (!snap.exists()) return fromMock ?? null;
    return { id: snap.id, ...(snap.data() as Omit<Submission, "id">) };
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.submissions, error);
    return fromMock ?? null;
  }
}

export async function createSubmission(
  data: RawSubmissionInput | CreateSubmissionInput
): Promise<{ success: boolean; id: string }> {
  const raw = data as RawSubmissionInput;
  const sanitized = sanitizeSubmissionInput(raw);
  const now = new Date().toISOString();
  const payload: Omit<Submission, "id"> = {
    ...sanitized,
    status: "pending",
    createdAt: now,
    updatedAt: now,
    ...(raw.importSource ? { importSource: raw.importSource } : {}),
    ...(raw.importedAt ? { importedAt: raw.importedAt } : {}),
  };

  if (!db) {
    const id = `mock-submission-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    devWarn("[CarRadar] Firebase not configured. Simulating submission.");
    addMockSubmission({ id, ...payload });
    return { success: true, id };
  }

  try {
    const ref = await addDoc(collection(db, COLLECTIONS.submissions), payload);
    return { success: true, id: ref.id };
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.submissions, error);
    const id = `mock-submission-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    devWarn("[CarRadar] Firestore write failed. Simulating submission.");
    addMockSubmission({ id, ...payload });
    return { success: true, id };
  }
}

export async function getSubmissionsByStatus(
  status: SubmissionStatusFilter = "all"
): Promise<Submission[]> {
  if (!db) {
    return sortByNewest(getMockSubmissionsByStatus(status));
  }

  try {
    const snapshot =
      status === "all"
        ? await getDocs(collection(db, COLLECTIONS.submissions))
        : await getDocs(
            query(
              collection(db, COLLECTIONS.submissions),
              where("status", "==", status)
            )
          );
    const items = sortByNewest(mapFirestoreSubmissions(snapshot));
    if (items.length > 0) return items;
    return sortByNewest(getMockSubmissionsByStatus(status));
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.submissions, error);
    return sortByNewest(getMockSubmissionsByStatus(status));
  }
}

export async function getPendingSubmissions(): Promise<Submission[]> {
  return getSubmissionsByStatus("pending");
}

export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
  reviewNote?: string,
  reviewedBy?: string
): Promise<boolean> {
  const now = new Date().toISOString();
  const note = reviewNote?.trim() || undefined;
  const patch: Partial<Submission> = {
    status,
    updatedAt: now,
    reviewedAt: now,
    ...(reviewedBy ? { reviewedBy } : {}),
    ...(note ? { reviewNote: note } : {}),
  };

  if (!db) {
    devWarn(`[CarRadar] Mock mode: submission → ${status}`, id);
    return updateMockSubmissionReview(id, patch);
  }

  try {
    await updateDoc(doc(db, COLLECTIONS.submissions, id), patch);
    return true;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.submissions, error);
    return updateMockSubmissionReview(id, patch);
  }
}

function persistPublishedEntityMock(
  entityId: string,
  payload: NonNullable<ReturnType<typeof mapSubmissionToPublicEntity>>
): void {
  if (payload.collection === COLLECTIONS.carShops) {
    addPublishedShop({ id: entityId, ...payload.entity } as CarShop);
    return;
  }
  if (payload.collection === COLLECTIONS.carEvents) {
    addPublishedEvent({ id: entityId, ...payload.entity } as CarEvent);
    return;
  }
  if (payload.collection === COLLECTIONS.clubs) {
    addPublishedClub({ id: entityId, ...payload.entity } as Club);
    return;
  }
  addPublishedMember({ id: entityId, ...payload.entity } as ClubMember);
}

export async function publishApprovedSubmission(
  id: string,
  reviewNote?: string,
  reviewedBy?: string,
  draft?: PublishDraft
): Promise<PublishResult> {
  const submission = await getSubmissionById(id);
  if (!submission) {
    return { success: false, published: false };
  }

  if (submission.approvedEntityId && submission.status === "approved") {
    return {
      success: true,
      published: Boolean(submission.publishedCollection),
      approvedEntityId: submission.approvedEntityId,
      publishedCollection: submission.publishedCollection as
        | PublishedCollectionSlug
        | undefined,
    };
  }

  if (isCorrectionOnlyApproval(submission.type)) {
    // TODO Day 10: Apply correction to target listing; status-only for now.
    const ok = await updateSubmissionStatus(
      id,
      "approved",
      reviewNote,
      reviewedBy
    );
    return { success: ok, published: false };
  }

  if (!canPublishSubmission(submission.type)) {
    const ok = await updateSubmissionStatus(
      id,
      "approved",
      reviewNote,
      reviewedBy
    );
    return { success: ok, published: false };
  }

  const publishType =
    submission.type === "community" ? "club" : submission.type;
  const entityId = generatePublishedEntityId(
    publishType as "shop" | "event" | "club" | "member"
  );

  const clubsForMember = [
    ...getPublishedClubs(),
    ...mockClubs.filter((c) => c.status === "approved"),
  ];
  const submissionForPublish = draft
    ? applyDraftToSubmission(submission, draft)
    : submission;

  const clubIdForMember =
    submissionForPublish.type === "member"
      ? resolveClubIdForMember(
          submissionForPublish.clubName,
          clubsForMember
        )
      : undefined;

  const mapped = draft
    ? mapPublishDraftToPublicEntity(draft, submission, {
        entityId,
        clubIdForMember,
      })
    : mapSubmissionToPublicEntity(submissionForPublish, {
        entityId,
        clubIdForMember,
      });
  if (!mapped) {
    return { success: false, published: false };
  }

  const now = new Date().toISOString();
  const submissionPatch: Partial<Submission> = {
    status: "approved",
    updatedAt: now,
    reviewedAt: now,
    approvedEntityId: entityId,
    publishedCollection: mapped.slug,
    ...(reviewedBy ? { reviewedBy } : {}),
    ...(reviewNote?.trim() ? { reviewNote: reviewNote.trim() } : {}),
  };

  if (!db) {
    persistPublishedEntityMock(entityId, mapped);
    updateMockSubmissionReview(id, submissionPatch);
    devWarn(
      `[CarRadar] Mock mode: published to ${mapped.slug}`,
      entityId
    );
    return {
      success: true,
      published: true,
      approvedEntityId: entityId,
      publishedCollection: mapped.slug,
    };
  }

  try {
    const batch = writeBatch(db);
    const entityRef = doc(collection(db, mapped.collection), entityId);
    batch.set(entityRef, mapped.entity);
    batch.update(doc(db, COLLECTIONS.submissions, id), submissionPatch);
    await batch.commit();
    return {
      success: true,
      published: true,
      approvedEntityId: entityId,
      publishedCollection: mapped.slug,
    };
  } catch (error) {
    logRepositoryFallback(mapped.collection, error);
    persistPublishedEntityMock(entityId, mapped);
    updateMockSubmissionReview(id, submissionPatch);
    devWarn("[CarRadar] Firestore publish failed; saved to mock store.");
    return {
      success: true,
      published: true,
      approvedEntityId: entityId,
      publishedCollection: mapped.slug,
    };
  }
}

export async function approveSubmission(
  id: string,
  reviewNote?: string,
  reviewedBy?: string,
  draft?: PublishDraft
): Promise<PublishResult> {
  return publishApprovedSubmission(id, reviewNote, reviewedBy, draft);
}

export async function rejectSubmission(
  id: string,
  reviewNote?: string
): Promise<boolean> {
  if (!reviewNote?.trim()) {
    return false;
  }
  return updateSubmissionStatus(id, "rejected", reviewNote);
}

export async function markSubmissionNeedsChanges(
  id: string,
  reviewNote?: string
): Promise<boolean> {
  if (!reviewNote?.trim()) {
    return false;
  }
  return updateSubmissionStatus(id, "needs_changes", reviewNote);
}
