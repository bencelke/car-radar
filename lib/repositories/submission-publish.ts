import { COLLECTIONS } from "@/lib/firebase/collections";
import type {
  CarEvent,
  CarShop,
  Club,
  ClubMember,
  PlaceCategory,
  Submission,
  SubmissionType,
} from "@/lib/types";
import { generateId } from "@/lib/repositories/utils";

/** Short names stored on submission.publishedCollection */
export type PublishedCollectionSlug =
  | "shops"
  | "events"
  | "clubs"
  | "members";

export type PublishableSubmissionType = "shop" | "event" | "club" | "member";

export type PublishedEntityPayload =
  | {
      collection: typeof COLLECTIONS.carShops;
      slug: PublishedCollectionSlug;
      entity: Omit<CarShop, "id">;
    }
  | {
      collection: typeof COLLECTIONS.carEvents;
      slug: PublishedCollectionSlug;
      entity: Omit<CarEvent, "id">;
    }
  | {
      collection: typeof COLLECTIONS.clubs;
      slug: PublishedCollectionSlug;
      entity: Omit<Club, "id">;
    }
  | {
      collection: typeof COLLECTIONS.clubMembers;
      slug: PublishedCollectionSlug;
      entity: Omit<ClubMember, "id">;
    };

export function canPublishSubmission(type: SubmissionType): boolean {
  return (
    type === "shop" ||
    type === "event" ||
    type === "club" ||
    type === "member" ||
    type === "community"
  );
}

export function isCorrectionOnlyApproval(type: SubmissionType): boolean {
  return type === "correction";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function toPlaceCategory(category?: string): PlaceCategory {
  const raw = (category ?? "other").toLowerCase().trim();
  const map: Record<string, PlaceCategory> = {
    tuning: "tuning",
    turbo: "turbo",
    wheels: "wheels",
    detailing: "detailing",
    wrap: "wrap_tint",
    wrap_tint: "wrap_tint",
    tint: "wrap_tint",
    club: "club",
    event: "event",
    vendor: "vendor",
    dealership: "dealership",
    audio: "audio",
    tires: "tires",
    other: "other",
  };
  if (map[raw]) return map[raw];
  if (raw.includes("wrap") || raw.includes("tint")) return "wrap_tint";
  if (raw.includes("wheel")) return "wheels";
  if (raw.includes("detail")) return "detailing";
  if (raw.includes("turbo") || raw.includes("tun")) return "turbo";
  return "other";
}

function defaultEventStart(submission: Submission): string {
  if (submission.startTime?.trim()) return submission.startTime.trim();
  const d = new Date();
  d.setDate(d.getDate() + 14);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
}

export function resolveClubIdForMember(
  clubName: string | undefined,
  clubs: Pick<Club, "id" | "name">[]
): string {
  if (!clubName?.trim()) {
    return clubs[0]?.id ?? "unassigned";
  }
  const normalized = clubName.trim().toLowerCase();
  const match = clubs.find((c) => c.name.toLowerCase() === normalized);
  return match?.id ?? clubs[0]?.id ?? "unassigned";
}

export function mapSubmissionToPublicEntity(
  submission: Submission,
  options?: {
    entityId?: string;
    clubIdForMember?: string;
  }
): PublishedEntityPayload | null {
  const now = new Date().toISOString();
  const sourceSubmissionId = submission.id;
  const address = submission.address ?? submission.location;

  if (submission.type === "correction") {
    return null;
  }

  const normalizedType: PublishableSubmissionType =
    submission.type === "community" ? "club" : submission.type;

  if (normalizedType === "shop") {
    const entity: Omit<CarShop, "id"> = {
      name: submission.name,
      category: toPlaceCategory(submission.category),
      status: "approved",
      city: submission.city,
      country: submission.country ?? "Germany",
      address,
      lat: submission.lat,
      lng: submission.lng,
      description: submission.description,
      instagram: submission.instagram,
      website: submission.website,
      verified: false,
      featured: false,
      services: submission.services ?? submission.tags ?? [],
      brandsSupported: submission.brandsSupported,
      sourceSubmissionId,
      createdAt: now,
      updatedAt: now,
    };
    return {
      collection: COLLECTIONS.carShops,
      slug: "shops",
      entity,
    };
  }

  if (normalizedType === "event") {
    const entity: Omit<CarEvent, "id"> = {
      title: submission.name,
      type: submission.category ?? "Meet",
      status: "approved",
      city: submission.city,
      country: submission.country ?? "Germany",
      address,
      lat: submission.lat,
      lng: submission.lng,
      description: submission.description,
      startTime: defaultEventStart(submission),
      endTime: submission.endTime,
      organizerName: submission.organizerName,
      organizerInstagram: submission.organizerInstagram,
      sourceUrl: submission.sourceUrl,
      verified: false,
      featured: false,
      sourceSubmissionId,
      createdAt: now,
      updatedAt: now,
    };
    return {
      collection: COLLECTIONS.carEvents,
      slug: "events",
      entity,
    };
  }

  if (normalizedType === "club") {
    const baseSlug = slugify(submission.name) || "club";
    const slug = options?.entityId
      ? `${baseSlug}-${options.entityId.slice(0, 8)}`
      : `${baseSlug}-${Date.now().toString(36)}`;
    const entity: Omit<Club, "id"> = {
      name: submission.name,
      slug,
      type: submission.clubType ?? submission.category ?? "Car club",
      category: submission.category,
      status: "approved",
      city: submission.city,
      country: submission.country ?? "Germany",
      area: submission.area,
      description: submission.description,
      instagram: submission.instagram,
      tiktok: submission.tiktok,
      youtube: submission.youtube,
      website: submission.website,
      memberCount: submission.memberCountEstimate,
      verified: false,
      featured: false,
      tags: submission.tags,
      lat: submission.lat,
      lng: submission.lng,
      sourceSubmissionId,
      createdAt: now,
      updatedAt: now,
    };
    return {
      collection: COLLECTIONS.clubs,
      slug: "clubs",
      entity,
    };
  }

  if (normalizedType === "member") {
    const clubId =
      options?.clubIdForMember ??
      resolveClubIdForMember(submission.clubName, []);
    const entity: Omit<ClubMember, "id"> = {
      clubId,
      displayName: submission.name,
      nickname: submission.carName,
      status: "approved",
      city: submission.city,
      country: submission.country ?? "Germany",
      area: submission.area,
      carMake: submission.carMake,
      carModel: submission.carModel,
      carYear: submission.carYear,
      carName: submission.carName,
      buildSummary: submission.buildSummary ?? submission.description,
      buildTags: submission.buildTags ?? submission.tags,
      instagram: submission.instagram,
      tiktok: submission.tiktok,
      youtube: submission.youtube,
      lat: submission.lat,
      lng: submission.lng,
      verifiedByClub: false,
      featured: false,
      sourceSubmissionId,
      createdAt: now,
      updatedAt: now,
    };
    return {
      collection: COLLECTIONS.clubMembers,
      slug: "members",
      entity,
    };
  }

  return null;
}

export function generatePublishedEntityId(type: PublishableSubmissionType): string {
  switch (type) {
    case "shop":
      return generateId("shop");
    case "event":
      return generateId("event");
    case "club":
      return generateId("club");
    case "member":
      return generateId("member");
  }
}
