import type { Submission } from "@/lib/types";
import { mockSubmissionsSeed } from "@/lib/mock-data/seeds";

let mockSubmissions: Submission[] = [...mockSubmissionsSeed];

export function getMockSubmissions(): Submission[] {
  return [...mockSubmissions];
}

export function addMockSubmission(submission: Submission): void {
  mockSubmissions = [submission, ...mockSubmissions];
}

export function updateMockSubmissionStatus(
  id: string,
  status: Submission["status"]
): boolean {
  const index = mockSubmissions.findIndex((s) => s.id === id);
  if (index === -1) return false;
  mockSubmissions[index] = { ...mockSubmissions[index], status };
  return true;
}

export function resetMockSubmissions(): void {
  mockSubmissions = [...mockSubmissionsSeed];
}
