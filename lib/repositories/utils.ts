import type { ListingStatus } from "@/lib/types";

export function sortFeaturedFirst<T extends { featured?: boolean }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))
  );
}

export function filterApproved<T extends { status: ListingStatus }>(items: T[]): T[] {
  return items.filter((item) => item.status === "approved");
}

export function logRepositoryFallback(collection: string, error: unknown): void {
  console.warn(
    `[CarRadar] Firestore query failed for "${collection}"; using mock fallback.`,
    error
  );
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
