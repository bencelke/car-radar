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
import { db, getFirebaseMode } from "@/lib/firebase/client";
import {
  addMockSubmission,
  getMockSubmissions,
  updateMockSubmissionStatus,
} from "@/lib/mock-data/submission-store";
import type { CreateSubmissionInput, Submission } from "@/lib/types";
import { generateId, logRepositoryFallback } from "@/lib/repositories/utils";

export async function createSubmission(
  data: CreateSubmissionInput
): Promise<{ success: boolean; id: string }> {
  const payload: Omit<Submission, "id"> = {
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (!db) {
    const id = generateId("sub");
    addMockSubmission({ id, ...payload });
    console.warn(
      "[CarRadar] Mock mode: submission saved locally only.",
      getFirebaseMode()
    );
    return { success: true, id };
  }

  try {
    const ref = await addDoc(collection(db, COLLECTIONS.submissions), payload);
    return { success: true, id: ref.id };
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.submissions, error);
    const id = generateId("sub");
    addMockSubmission({ id, ...payload });
    return { success: true, id };
  }
}

export async function getPendingSubmissions(): Promise<Submission[]> {
  if (!db) {
    return getMockSubmissions().filter((s) => s.status === "pending");
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.submissions),
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Submission
    );
    if (items.length > 0) return items;
    return getMockSubmissions().filter((s) => s.status === "pending");
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.submissions, error);
    return getMockSubmissions().filter((s) => s.status === "pending");
  }
}

export async function approveSubmission(id: string): Promise<boolean> {
  if (!db) {
    console.warn("[CarRadar] Mock mode: approveSubmission", id);
    return updateMockSubmissionStatus(id, "approved");
  }

  try {
    await updateDoc(doc(db, COLLECTIONS.submissions, id), {
      status: "approved",
    });
    return true;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.submissions, error);
    return updateMockSubmissionStatus(id, "approved");
  }
}

export async function rejectSubmission(id: string): Promise<boolean> {
  if (!db) {
    console.warn("[CarRadar] Mock mode: rejectSubmission", id);
    return updateMockSubmissionStatus(id, "rejected");
  }

  try {
    await updateDoc(doc(db, COLLECTIONS.submissions, id), {
      status: "rejected",
    });
    return true;
  } catch (error) {
    logRepositoryFallback(COLLECTIONS.submissions, error);
    return updateMockSubmissionStatus(id, "rejected");
  }
}
