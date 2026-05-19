import type { CreateSubmissionInput, SubmissionType } from "@/lib/types";

export type RawSubmissionInput = {
  type: SubmissionType;
  name: string;
  category?: string;
  country?: string;
  city: string;
  area?: string;
  address?: string;
  location?: string;
  lat?: string | number;
  lng?: string | number;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
  sourceUrl?: string;
  description: string;
  tags?: string | string[];
  submittedByEmail?: string;
  submittedByUid?: string;
  permissionConfirmed?: boolean;
  services?: string | string[];
  brandsSupported?: string | string[];
  startTime?: string;
  endTime?: string;
  organizerName?: string;
  organizerInstagram?: string;
  clubType?: string;
  memberCountEstimate?: string | number;
  clubName?: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  carName?: string;
  buildSummary?: string;
  buildTags?: string | string[];
  targetType?: string;
  targetName?: string;
  correctionDetails?: string;
  importSource?: string;
  importedAt?: string;
};

function trim(value?: string): string | undefined {
  if (value == null) return undefined;
  const t = value.trim();
  return t.length > 0 ? t : undefined;
}

export function normalizeUrl(value?: string): string | undefined {
  const raw = trim(value);
  if (!raw) return undefined;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("@")) {
    const handle = raw.slice(1);
    return `https://instagram.com/${handle}`;
  }
  if (/^[\w.-]+\.[a-z]{2,}/i.test(raw) && !raw.includes(" ")) {
    return `https://${raw}`;
  }
  return raw;
}

export function csvToArray(value?: string | string[]): string[] | undefined {
  if (value == null) return undefined;
  const parts = Array.isArray(value)
    ? value
    : value.split(/[,;]+/);
  const items = parts
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function parseOptionalNumber(value?: string | number): number | undefined {
  if (value == null || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : undefined;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    if (out[key] === undefined) delete out[key];
  }
  return out;
}

export function sanitizeSubmissionInput(
  raw: RawSubmissionInput
): CreateSubmissionInput {
  const type = raw.type;
  const address =
    trim(raw.address) ?? trim(raw.location);
  const base = stripUndefined({
    type,
    name: trim(raw.name) ?? "",
    category: trim(raw.category),
    country: trim(raw.country),
    city: trim(raw.city) ?? "",
    area: trim(raw.area),
    address,
    lat: parseOptionalNumber(raw.lat),
    lng: parseOptionalNumber(raw.lng),
    instagram: normalizeUrl(raw.instagram),
    tiktok: normalizeUrl(raw.tiktok),
    youtube: normalizeUrl(raw.youtube),
    website: normalizeUrl(raw.website),
    sourceUrl: normalizeUrl(raw.sourceUrl),
    description: trim(raw.description) ?? "",
    tags: csvToArray(raw.tags),
    submittedByEmail: trim(raw.submittedByEmail),
    submittedByUid: trim(raw.submittedByUid),
    permissionConfirmed: raw.permissionConfirmed === true ? true : undefined,
    importSource: trim(raw.importSource),
    importedAt: trim(raw.importedAt),
  });

  if (type === "shop") {
    return stripUndefined({
      ...base,
      services: csvToArray(raw.services),
      brandsSupported: csvToArray(raw.brandsSupported),
    });
  }

  if (type === "event") {
    return stripUndefined({
      ...base,
      startTime: trim(raw.startTime),
      endTime: trim(raw.endTime),
      organizerName: trim(raw.organizerName),
      organizerInstagram: normalizeUrl(raw.organizerInstagram),
    });
  }

  if (type === "club") {
    const estimate = parseOptionalNumber(raw.memberCountEstimate);
    return stripUndefined({
      ...base,
      clubType: trim(raw.clubType),
      memberCountEstimate: estimate,
    });
  }

  if (type === "member") {
    return stripUndefined({
      ...base,
      clubName: trim(raw.clubName),
      carMake: trim(raw.carMake),
      carModel: trim(raw.carModel),
      carYear: trim(raw.carYear),
      carName: trim(raw.carName),
      buildSummary: trim(raw.buildSummary),
      buildTags: csvToArray(raw.buildTags),
      permissionConfirmed: raw.permissionConfirmed === true,
    });
  }

  if (type === "correction") {
    const targetName = trim(raw.targetName) ?? base.name;
    const details =
      trim(raw.correctionDetails) ?? base.description;
    return stripUndefined({
      ...base,
      name: targetName,
      description: details,
      targetType: trim(raw.targetType) as CreateSubmissionInput["targetType"],
      targetName,
      correctionDetails: details,
    });
  }

  return base;
}
