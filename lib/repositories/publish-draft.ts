import type { Submission } from "@/lib/types";
import {
  type PublishedEntityPayload,
  type PublishableSubmissionType,
  mapSubmissionToPublicEntity,
} from "@/lib/repositories/submission-publish";

export type PublishDraft = {
  submissionId: string;
  publishType: PublishableSubmissionType;
  name: string;
  description: string;
  city: string;
  country: string;
  address?: string;
  lat?: string;
  lng?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  tags?: string;
  category?: string;
  startTime?: string;
  endTime?: string;
  clubName?: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  buildSummary?: string;
};

export type PublishDraftValidation = {
  valid: boolean;
  fieldErrors: Partial<Record<keyof PublishDraft, string>>;
  errors: string[];
  warnings: string[];
};

function trim(value?: string): string | undefined {
  const t = value?.trim();
  return t ? t : undefined;
}

function parseCoord(value?: string): number | undefined {
  const raw = trim(value);
  if (!raw) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function parseTagsCsv(value?: string): string[] | undefined {
  const raw = trim(value);
  if (!raw) return undefined;
  const items = raw
    .split(/[,;]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function resolvePublishType(type: Submission["type"]): PublishableSubmissionType | null {
  if (type === "shop" || type === "event" || type === "club" || type === "member") {
    return type;
  }
  if (type === "community") return "club";
  return null;
}

export function createPublishDraftFromSubmission(
  submission: Submission
): PublishDraft | null {
  const publishType = resolvePublishType(submission.type);
  if (!publishType) return null;

  const tags =
    submission.tags?.join(", ") ??
    submission.buildTags?.join(", ") ??
    submission.services?.join(", ");

  return {
    submissionId: submission.id,
    publishType,
    name: submission.name,
    description: submission.description,
    city: submission.city,
    country: submission.country ?? "Germany",
    address: submission.address ?? submission.location,
    lat: submission.lat != null ? String(submission.lat) : "",
    lng: submission.lng != null ? String(submission.lng) : "",
    websiteUrl: submission.website ?? "",
    instagramUrl: submission.instagram ?? "",
    tags: tags ?? "",
    category: submission.category ?? submission.clubType ?? "",
    startTime: submission.startTime ?? "",
    endTime: submission.endTime ?? "",
    clubName: submission.clubName ?? "",
    carMake: submission.carMake ?? "",
    carModel: submission.carModel ?? "",
    carYear: submission.carYear ?? "",
    buildSummary: submission.buildSummary ?? "",
  };
}

export function validatePublishDraft(draft: PublishDraft): PublishDraftValidation {
  const fieldErrors: PublishDraftValidation["fieldErrors"] = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!draft.name.trim()) {
    fieldErrors.name = "Name is required.";
    errors.push("Name is required.");
  }
  if (!draft.city.trim()) {
    fieldErrors.city = "City is required.";
    errors.push("City is required.");
  }
  if (!draft.description.trim()) {
    fieldErrors.description = "Description is required.";
    errors.push("Description is required.");
  }

  if (draft.lat?.trim()) {
    const lat = parseCoord(draft.lat);
    if (lat == null || lat < -90 || lat > 90) {
      fieldErrors.lat = "Invalid latitude.";
      errors.push("Invalid latitude.");
    }
  }
  if (draft.lng?.trim()) {
    const lng = parseCoord(draft.lng);
    if (lng == null || lng < -180 || lng > 180) {
      fieldErrors.lng = "Invalid longitude.";
      errors.push("Invalid longitude.");
    }
  }

  if (!draft.lat?.trim() || !draft.lng?.trim()) {
    warnings.push(
      "No coordinates yet — listing may not appear correctly on the map."
    );
  }

  if (draft.publishType === "event" && !draft.startTime?.trim()) {
    warnings.push("No start date/time — a default date will be used on publish.");
  }

  return {
    valid: errors.length === 0,
    fieldErrors,
    errors,
    warnings,
  };
}

export function applyDraftToSubmission(
  submission: Submission,
  draft: PublishDraft
): Submission {
  const tags = parseTagsCsv(draft.tags);
  return {
    ...submission,
    name: draft.name.trim(),
    description: draft.description.trim(),
    city: draft.city.trim(),
    country: draft.country.trim() || "Germany",
    address: trim(draft.address),
    lat: parseCoord(draft.lat),
    lng: parseCoord(draft.lng),
    website: trim(draft.websiteUrl),
    instagram: trim(draft.instagramUrl),
    tags,
    category: trim(draft.category) ?? submission.category,
    startTime: trim(draft.startTime) ?? submission.startTime,
    endTime: trim(draft.endTime) ?? submission.endTime,
    clubName: trim(draft.clubName) ?? submission.clubName,
    carMake: trim(draft.carMake) ?? submission.carMake,
    carModel: trim(draft.carModel) ?? submission.carModel,
    carYear: trim(draft.carYear) ?? submission.carYear,
    buildSummary: trim(draft.buildSummary) ?? submission.buildSummary,
    services:
      submission.type === "shop" && tags ? tags : submission.services,
    buildTags:
      submission.type === "member" && tags ? tags : submission.buildTags,
  };
}

export function mapPublishDraftToPublicEntity(
  draft: PublishDraft,
  submission: Submission,
  options?: {
    entityId?: string;
    clubIdForMember?: string;
  }
): PublishedEntityPayload | null {
  const merged = applyDraftToSubmission(submission, draft);
  return mapSubmissionToPublicEntity(merged, options);
}
