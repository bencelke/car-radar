import type { MapCategoryFilterId, MapFilterId } from "@/lib/types";

export function countActiveMapFilters(
  typeFilter: MapFilterId,
  categoryFilter: MapCategoryFilterId,
  search?: string
): number {
  let count = 0;
  if (typeFilter !== "all") count += 1;
  if (categoryFilter !== "all") count += 1;
  if (search?.trim()) count += 1;
  return count;
}
