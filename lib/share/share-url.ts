import type {
  CarEvent,
  CarShop,
  Club,
  ClubMember,
  GarageCar,
  GarageProfile,
  ShareEntityType,
} from "@/lib/types";
import {
  clubDetailPath,
  eventDetailPath,
  memberDetailPath,
  shopDetailPath,
} from "@/lib/utils/entity-paths";

export type ShareTrackingParams = {
  ref?: string;
  source?: string;
  campaign?: string;
};

export type ShareEntityRef =
  | { entityType: "garage"; garage: GarageProfile }
  | { entityType: "member"; member: ClubMember }
  | { entityType: "club"; club: Club }
  | { entityType: "event"; event: CarEvent }
  | { entityType: "shop"; shop: CarShop };

export function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export function normalizeAbsoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const origin = getSiteOrigin();
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getCanonicalSharePath(ref: ShareEntityRef): string {
  switch (ref.entityType) {
    case "garage":
      return `/garage/${ref.garage.id}`;
    case "member":
      return memberDetailPath(ref.member);
    case "club":
      return clubDetailPath(ref.club);
    case "event":
      return eventDetailPath(ref.event);
    case "shop":
      return shopDetailPath(ref.shop);
  }
}

export function getCanonicalShareUrl(ref: ShareEntityRef): string {
  return normalizeAbsoluteUrl(getCanonicalSharePath(ref));
}

export function appendShareTracking(
  url: string,
  params: ShareTrackingParams = {}
): string {
  try {
    const parsed = new URL(url);
    if (params.ref) parsed.searchParams.set("ref", params.ref);
    if (params.source) parsed.searchParams.set("source", params.source);
    if (params.campaign) parsed.searchParams.set("campaign", params.campaign);
    return parsed.toString();
  } catch {
    return url;
  }
}

export function buildInviteUrl(inviteCode: string): string {
  return normalizeAbsoluteUrl(`/invite/${inviteCode}`);
}

export function garageShareRef(
  garage: GarageProfile,
  car?: GarageCar | null
): ShareEntityRef & { entityType: "garage" } {
  return { entityType: "garage", garage, car: car ?? undefined } as ShareEntityRef & {
    entityType: "garage";
  };
}

export function entityIdFromRef(ref: ShareEntityRef): string {
  switch (ref.entityType) {
    case "garage":
      return ref.garage.id;
    case "member":
      return ref.member.id;
    case "club":
      return ref.club.id;
    case "event":
      return ref.event.id;
    case "shop":
      return ref.shop.id;
  }
}

export function entityTypeLabel(type: ShareEntityType): string {
  return type;
}
