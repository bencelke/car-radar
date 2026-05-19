import { getApprovedClubMembers } from "@/lib/repositories/club-members";
import { getApprovedClubs } from "@/lib/repositories/clubs";
import { getApprovedEvents } from "@/lib/repositories/events";
import type { PublishDraft } from "@/lib/repositories/publish-draft";
import { createPublishDraftFromSubmission } from "@/lib/repositories/publish-draft";
import {
  type PublishedCollectionSlug,
  type PublishableSubmissionType,
} from "@/lib/repositories/submission-publish";
import { getApprovedShops } from "@/lib/repositories/shops";
import type { Submission } from "@/lib/types";

export type PotentialDuplicate = {
  id: string;
  name: string;
  collection: PublishedCollectionSlug;
  city: string;
  country?: string;
  matchReason: string;
};

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeUrl(value?: string): string {
  if (!value?.trim()) return "";
  return value
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}

function namesAreClose(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 4 && nb.length >= 4) {
    if (na.includes(nb) || nb.includes(na)) return true;
  }
  return false;
}

function sameCityCountry(
  aCity: string,
  aCountry: string | undefined,
  bCity: string,
  bCountry: string | undefined
): boolean {
  if (normalizeName(aCity) !== normalizeName(bCity)) return false;
  const ac = (aCountry ?? "").toLowerCase();
  const bc = (bCountry ?? "").toLowerCase();
  if (!ac || !bc) return true;
  return ac === bc;
}

function sameEventDay(a?: string, b?: string): boolean {
  if (!a?.trim() || !b?.trim()) return false;
  try {
    const da = new Date(a);
    const db = new Date(b);
    return (
      da.getFullYear() === db.getFullYear() &&
      da.getMonth() === db.getMonth() &&
      da.getDate() === db.getDate()
    );
  } catch {
    return false;
  }
}

function publishTypeToCollection(
  type: PublishableSubmissionType
): PublishedCollectionSlug {
  switch (type) {
    case "shop":
      return "shops";
    case "event":
      return "events";
    case "club":
      return "clubs";
    case "member":
      return "members";
  }
}

type DraftLike = {
  publishType: PublishableSubmissionType;
  name: string;
  city: string;
  country: string;
  websiteUrl?: string;
  instagramUrl?: string;
  startTime?: string;
};

function resolveDraftLike(
  submission: Submission,
  draft?: PublishDraft
): DraftLike | null {
  if (draft) {
    return {
      publishType: draft.publishType,
      name: draft.name,
      city: draft.city,
      country: draft.country,
      websiteUrl: draft.websiteUrl,
      instagramUrl: draft.instagramUrl,
      startTime: draft.startTime,
    };
  }
  const fromSubmission = createPublishDraftFromSubmission(submission);
  if (!fromSubmission) return null;
  return {
    publishType: fromSubmission.publishType,
    name: fromSubmission.name,
    city: fromSubmission.city,
    country: fromSubmission.country,
    websiteUrl: fromSubmission.websiteUrl,
    instagramUrl: fromSubmission.instagramUrl,
    startTime: fromSubmission.startTime,
  };
}

export async function findPotentialDuplicatesForSubmission(
  submission: Submission,
  draft?: PublishDraft
): Promise<PotentialDuplicate[]> {
  const probe = resolveDraftLike(submission, draft);
  if (!probe) return [];

  const collection = publishTypeToCollection(probe.publishType);
  const matches: PotentialDuplicate[] = [];
  const seen = new Set<string>();

  const add = (dup: PotentialDuplicate) => {
    const key = `${dup.collection}:${dup.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    matches.push(dup);
  };

  if (probe.publishType === "shop") {
    const shops = await getApprovedShops();
    const web = normalizeUrl(probe.websiteUrl);
    const ig = normalizeUrl(probe.instagramUrl);
    for (const shop of shops) {
      if (shop.sourceSubmissionId === submission.id) continue;
      const reasons: string[] = [];
      if (namesAreClose(probe.name, shop.name)) {
        if (sameCityCountry(probe.city, probe.country, shop.city, shop.country)) {
          reasons.push("Same name and city");
        }
      }
      if (web && normalizeUrl(shop.website) === web) {
        reasons.push("Same website");
      }
      if (ig && normalizeUrl(shop.instagram) === ig) {
        reasons.push("Same Instagram");
      }
      if (reasons.length > 0) {
        add({
          id: shop.id,
          name: shop.name,
          collection,
          city: shop.city,
          country: shop.country,
          matchReason: reasons.join(" · "),
        });
      }
    }
    return matches;
  }

  if (probe.publishType === "event") {
    const events = await getApprovedEvents();
    for (const event of events) {
      if (event.sourceSubmissionId === submission.id) continue;
      const reasons: string[] = [];
      if (
        namesAreClose(probe.name, event.title) &&
        sameCityCountry(probe.city, probe.country, event.city, event.country)
      ) {
        reasons.push("Same name and city");
      }
      if (
        namesAreClose(probe.name, event.title) &&
        sameEventDay(probe.startTime, event.startTime)
      ) {
        reasons.push("Same name and date");
      }
      if (reasons.length > 0) {
        add({
          id: event.id,
          name: event.title,
          collection,
          city: event.city,
          country: event.country,
          matchReason: [...new Set(reasons)].join(" · "),
        });
      }
    }
    return matches;
  }

  if (probe.publishType === "club") {
    const clubs = await getApprovedClubs();
    const web = normalizeUrl(probe.websiteUrl);
    const ig = normalizeUrl(probe.instagramUrl);
    for (const club of clubs) {
      if (club.sourceSubmissionId === submission.id) continue;
      const reasons: string[] = [];
      if (
        namesAreClose(probe.name, club.name) &&
        sameCityCountry(probe.city, probe.country, club.city, club.country)
      ) {
        reasons.push("Same name and city");
      }
      if (web && normalizeUrl(club.website) === web) {
        reasons.push("Same website");
      }
      if (ig && normalizeUrl(club.instagram) === ig) {
        reasons.push("Same Instagram");
      }
      if (reasons.length > 0) {
        add({
          id: club.id,
          name: club.name,
          collection,
          city: club.city,
          country: club.country,
          matchReason: reasons.join(" · "),
        });
      }
    }
    return matches;
  }

  if (probe.publishType === "member") {
    const members = await getApprovedClubMembers();
    for (const member of members) {
      if (member.sourceSubmissionId === submission.id) continue;
      if (
        namesAreClose(probe.name, member.displayName) &&
        sameCityCountry(probe.city, probe.country, member.city, member.country)
      ) {
        add({
          id: member.id,
          name: member.displayName,
          collection,
          city: member.city,
          country: member.country,
          matchReason: "Same name and city",
        });
      }
    }
  }

  return matches;
}
