import type { ClubMemberStatus, ListingStatus } from "@/lib/types";

export function sortFeaturedFirst<T extends { featured?: boolean }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  );
}

export function filterApproved<T extends { status: ListingStatus }>(items: T[]): T[] {
  return items.filter((item) => item.status === "approved");
}

export function filterApprovedMembers<T extends { status: ClubMemberStatus }>(
  items: T[]
): T[] {
  return items.filter((item) => item.status === "approved");
}

const loggedFallbackCollections = new Set<string>();

export function logRepositoryFallback(collection: string, error: unknown): void {
  if (
    process.env.NODE_ENV === "development" &&
    loggedFallbackCollections.has(collection)
  ) {
    return;
  }

  if (process.env.NODE_ENV === "development") {
    loggedFallbackCollections.add(collection);
  }

  console.warn(
    `[CarRadar] Firestore query failed for "${collection}"; using mock fallback.`,
    error
  );
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function isFirestorePermissionDenied(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    return code === "permission-denied";
  }
  if (error instanceof Error) {
    return error.message.includes("permission-denied");
  }
  return false;
}
