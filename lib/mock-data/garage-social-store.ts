import type { GarageFeedItem, GarageFollow } from "@/lib/types";

const follows = new Map<string, GarageFollow>();
const feedItems = new Map<string, GarageFeedItem>();

export function getMockGarageFollows(): GarageFollow[] {
  return [...follows.values()];
}

export function getMockGarageFeedItems(): GarageFeedItem[] {
  return [...feedItems.values()];
}

export function setMockGarageFollow(doc: GarageFollow): void {
  follows.set(doc.id, doc);
}

export function deleteMockGarageFollow(id: string): void {
  follows.delete(id);
}

export function setMockGarageFeedItem(doc: GarageFeedItem): void {
  feedItems.set(doc.id, doc);
}

export function deleteMockGarageFeedItem(id: string): void {
  feedItems.delete(id);
}
