import type { Submission, SubmissionStatus } from "@/lib/types";
import { mockSubmissionsSeed } from "@/lib/mock-data/seeds";

let mockSubmissions: Submission[] = [...mockSubmissionsSeed];

export function getMockSubmissions(): Submission[] {
  return [...mockSubmissions];
}

export function getMockSubmissionsByStatus(
  status: SubmissionStatus | "all"
): Submission[] {
  const all = getMockSubmissions();
  if (status === "all") return all;
  return all.filter((s) => s.status === status);
}

export function addMockSubmission(submission: Submission): void {
  mockSubmissions = [submission, ...mockSubmissions];
}

export function updateMockSubmissionReview(
  id: string,
  patch: Partial<Submission>
): boolean {
  const index = mockSubmissions.findIndex((s) => s.id === id);
  if (index === -1) return false;
  mockSubmissions[index] = { ...mockSubmissions[index], ...patch };
  return true;
}

/** @deprecated Use updateMockSubmissionReview */
export function updateMockSubmissionStatus(
  id: string,
  status: Submission["status"]
): boolean {
  return updateMockSubmissionReview(id, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function resetMockSubmissions(): void {
  mockSubmissions = [...mockSubmissionsSeed];
}
