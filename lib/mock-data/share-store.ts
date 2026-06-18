import type {
  ShareAnalyticsEvent,
  ShareLink,
  UserInvite,
} from "@/lib/types";

const links = new Map<string, ShareLink>();
const invites = new Map<string, UserInvite>();
const analytics = new Map<string, ShareAnalyticsEvent>();

export function getMockShareLinks(): ShareLink[] {
  return [...links.values()];
}

export function setMockShareLink(doc: ShareLink): void {
  links.set(doc.id, doc);
}

export function getMockUserInvites(): UserInvite[] {
  return [...invites.values()];
}

export function setMockUserInvite(doc: UserInvite): void {
  invites.set(doc.id, doc);
}

export function getMockShareAnalytics(): ShareAnalyticsEvent[] {
  return [...analytics.values()];
}

export function setMockShareAnalytics(doc: ShareAnalyticsEvent): void {
  analytics.set(doc.id, doc);
}
