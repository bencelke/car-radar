import type {
  AppNotification,
  CarEvent,
  ClubAnnouncement,
  ClubFollow,
  CommunityPost,
  EventCheckIn,
  EventRsvp,
  PostComment,
  PostReaction,
  PostReport,
} from "@/lib/types";

const follows = new Map<string, ClubFollow>();
const announcements = new Map<string, ClubAnnouncement>();
const rsvps = new Map<string, EventRsvp>();
const checkIns = new Map<string, EventCheckIn>();
const clubEvents = new Map<string, CarEvent>();
const notifications = new Map<string, AppNotification>();
const posts = new Map<string, CommunityPost>();
const postComments = new Map<string, PostComment>();
const postReactions = new Map<string, PostReaction>();
const postReports = new Map<string, PostReport>();

export function getMockFollows(): ClubFollow[] {
  return [...follows.values()];
}

export function getMockAnnouncements(): ClubAnnouncement[] {
  return [...announcements.values()];
}

export function getMockRsvps(): EventRsvp[] {
  return [...rsvps.values()];
}

export function getMockClubEvents(): CarEvent[] {
  return [...clubEvents.values()];
}

export function setMockFollow(doc: ClubFollow): void {
  follows.set(doc.id, doc);
}

export function deleteMockFollow(id: string): void {
  follows.delete(id);
}

export function setMockAnnouncement(doc: ClubAnnouncement): void {
  announcements.set(doc.id, doc);
}

export function setMockRsvp(doc: EventRsvp): void {
  rsvps.set(doc.id, doc);
}

export function deleteMockRsvp(id: string): void {
  rsvps.delete(id);
}

export function setMockClubEvent(doc: CarEvent): void {
  clubEvents.set(doc.id, doc);
}

export function getMockCheckIns(): EventCheckIn[] {
  return [...checkIns.values()];
}

export function setMockCheckIn(doc: EventCheckIn): void {
  checkIns.set(doc.id, doc);
}

export function getMockNotifications(): AppNotification[] {
  return [...notifications.values()];
}

export function setMockNotification(doc: AppNotification): void {
  notifications.set(doc.id, doc);
}

export function updateMockNotification(
  id: string,
  patch: Partial<AppNotification>
): AppNotification | null {
  const existing = notifications.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, id: existing.id };
  notifications.set(id, updated);
  return updated;
}

export function getMockPosts(): CommunityPost[] {
  return [...posts.values()];
}

export function setMockPost(doc: CommunityPost): void {
  posts.set(doc.id, doc);
}

export function getMockPostComments(): PostComment[] {
  return [...postComments.values()];
}

export function setMockPostComment(doc: PostComment): void {
  postComments.set(doc.id, doc);
}

export function getMockPostReactions(): PostReaction[] {
  return [...postReactions.values()];
}

export function setMockPostReaction(doc: PostReaction): void {
  postReactions.set(doc.id, doc);
}

export function deleteMockPostReaction(id: string): void {
  postReactions.delete(id);
}

export function getMockPostReports(): PostReport[] {
  return [...postReports.values()];
}

export function setMockPostReport(doc: PostReport): void {
  postReports.set(doc.id, doc);
}
