import type { CarEvent, CarShop, Club, ClubMember } from "@/lib/types";

let publishedShops: CarShop[] = [];
let publishedEvents: CarEvent[] = [];
let publishedClubs: Club[] = [];
let publishedMembers: ClubMember[] = [];

export function getPublishedShops(): CarShop[] {
  return [...publishedShops];
}

export function getPublishedEvents(): CarEvent[] {
  return [...publishedEvents];
}

export function getPublishedClubs(): Club[] {
  return [...publishedClubs];
}

export function getPublishedMembers(): ClubMember[] {
  return [...publishedMembers];
}

export function addPublishedShop(shop: CarShop): void {
  publishedShops = [shop, ...publishedShops.filter((s) => s.id !== shop.id)];
}

export function addPublishedEvent(event: CarEvent): void {
  publishedEvents = [event, ...publishedEvents.filter((e) => e.id !== event.id)];
}

export function addPublishedClub(club: Club): void {
  publishedClubs = [club, ...publishedClubs.filter((c) => c.id !== club.id)];
}

export function addPublishedMember(member: ClubMember): void {
  publishedMembers = [
    member,
    ...publishedMembers.filter((m) => m.id !== member.id),
  ];
}

/** Dev session: import a full club + members (until server restart). */
export function importClubBundle(club: Club, members: ClubMember[]): void {
  addPublishedClub({ ...club, memberCount: members.length });
  for (const member of members) {
    addPublishedMember(member);
  }
}

export function resetPublishedEntities(): void {
  publishedShops = [];
  publishedEvents = [];
  publishedClubs = [];
  publishedMembers = [];
}
