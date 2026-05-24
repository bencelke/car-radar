import Papa from "papaparse";

import type { Club, ClubMember } from "@/lib/types";
import { slugify } from "@/lib/utils/slug";

export type ClubImportDetails = {
  clubId: string;
  clubName: string;
  city: string;
  area: string;
  country: string;
  description: string;
  instagram: string;
  website: string;
  vehicleTypes: string;
  primaryBrands: string;
  tags: string;
};

export type ClubMemberCsvRow = {
  rowNumber: number;
  instagram: string;
  carModel: string;
  photo: string;
  location: string;
};

export type ClubMemberImportIssueCode =
  | "missing_instagram"
  | "missing_car_model"
  | "missing_location"
  | "missing_photo"
  | "unknown_car_make"
  | "invalid_instagram";

export type ClubMemberImportIssue = {
  code: ClubMemberImportIssueCode;
  field?: string;
};

export type ClubMemberRowPreview = {
  rowNumber: number;
  instagramHandle: string;
  displayName: string;
  carName: string;
  carMake?: string;
  carModel?: string;
  city: string;
  country: string;
  memberId: string;
  imageUrl: string;
  instagramUrl: string;
  status: "valid" | "warning" | "error";
  warnings: ClubMemberImportIssue[];
  errors: ClubMemberImportIssue[];
};

export type ClubImportBundle = {
  club: Club;
  members: ClubMember[];
};

const KNOWN_MAKES = [
  "Mercedes-Benz",
  "Mercedes",
  "Volkswagen",
  "Land Rover",
  "Alfa Romeo",
  "Aston Martin",
  "BMW",
  "Audi",
  "Mini",
  "Honda",
  "Toyota",
  "Nissan",
  "Ford",
  "Dodge",
  "Chevrolet",
  "Porsche",
  "Subaru",
  "Mazda",
  "Lexus",
  "Volvo",
  "Jeep",
  "Fiat",
  "Peugeot",
  "Renault",
  "Seat",
  "Skoda",
  "Hyundai",
  "Kia",
  "Tesla",
  "McLaren",
  "Lamborghini",
  "Ferrari",
  "Mitsubishi",
] as const;

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  wiesbaden: { lat: 50.0826, lng: 8.2493 },
  kaiserslautern: { lat: 49.443, lng: 7.769 },
  ramstein: { lat: 49.4375, lng: 7.602 },
  frankfurt: { lat: 50.1109, lng: 8.6821 },
  mannheim: { lat: 49.4875, lng: 8.466 },
  stuttgart: { lat: 48.7758, lng: 9.1829 },
  nurburg: { lat: 50.334, lng: 6.942 },
  landstuhl: { lat: 49.428, lng: 7.568 },
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function cell(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

export function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function normalizeInstagramHandle(raw: string): string {
  let s = raw.trim();
  if (!s) return "";
  s = s.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  s = s.replace(/^@+/, "");
  s = s.replace(/\/+$/, "");
  s = (s.split("?")[0] ?? s).trim();
  return s;
}

export function instagramProfileUrl(handle: string): string {
  const encoded = encodeURIComponent(handle);
  return `https://instagram.com/${encoded}`;
}

export function memberIdFromHandle(clubId: string, handle: string): string {
  const slug = slugify(handle);
  return slug ? `${clubId}-${slug}` : `${clubId}-member`;
}

export function memberImagePublicUrl(clubId: string, memberId: string): string {
  return `/data/clubs/${clubId}/images/${memberId}.webp`;
}

export function googleSheetsToExportCsvUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed.includes("docs.google.com/spreadsheets")) return null;

  const idMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;

  const spreadsheetId = idMatch[1];
  let gid = "0";
  const gidMatch = trimmed.match(/[?&#]gid=(\d+)/);
  if (gidMatch) gid = gidMatch[1];

  if (trimmed.includes("/export?") && trimmed.includes("format=csv")) {
    return trimmed;
  }

  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
}

export function parseClubMemberCsv(csvText: string): {
  rows: ClubMemberCsvRow[];
  parseErrors: string[];
} {
  const trimmed = csvText.trim();
  if (!trimmed) {
    return { rows: [], parseErrors: ["CSV is empty."] };
  }

  const result = Papa.parse<Record<string, string>>(trimmed, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => normalizeHeader(h),
  });

  const parseErrors = result.errors.map(
    (e) => `Row ${e.row ?? "?"}: ${e.message}`
  );

  const get = (raw: Record<string, string>, ...keys: string[]) => {
    for (const key of keys) {
      const v = cell(raw[key]);
      if (v) return v;
    }
    return "";
  };

  const rows = (result.data ?? []).map((raw, index) => ({
    rowNumber: index + 2,
    instagram: get(raw, "instagram", "instagram handle", "handle", "ig"),
    carModel: get(raw, "car model", "car", "vehicle", "model"),
    photo: get(raw, "photo", "image", "image url", "car photo"),
    location: get(raw, "location", "city", "area"),
  }));

  return { rows, parseErrors };
}

export function parseLocation(
  location: string,
  defaults: { city: string; country: string }
): { city: string; country: string } {
  const trimmed = location.trim();
  if (!trimmed) return { ...defaults };

  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      city: parts[0],
      country: parts[parts.length - 1],
    };
  }
  if (parts.length === 1) {
    return { city: parts[0], country: defaults.country };
  }
  return { ...defaults };
}

export function parseCarFromModel(carModel: string): {
  carName: string;
  carMake?: string;
  carModel?: string;
  unknownMake: boolean;
} {
  const trimmed = carModel.trim();
  if (!trimmed) {
    return { carName: "", unknownMake: false };
  }

  const lower = trimmed.toLowerCase();
  for (const make of KNOWN_MAKES) {
    if (lower.startsWith(make.toLowerCase())) {
      const rest = trimmed.slice(make.length).trim();
      return {
        carName: trimmed,
        carMake: make,
        carModel: rest || undefined,
        unknownMake: false,
      };
    }
  }

  return { carName: trimmed, unknownMake: true };
}

function buildTags(carMake?: string, carModel?: string, carName?: string): string[] {
  const tags = new Set<string>();
  if (carMake) tags.add(carMake.toLowerCase());
  if (carModel) {
    carModel
      .toLowerCase()
      .split(/[\s/]+/)
      .filter((t) => t.length > 1)
      .forEach((t) => tags.add(t));
  }
  if (tags.size === 0 && carName) {
    carName
      .toLowerCase()
      .split(/[\s/]+/)
      .slice(0, 3)
      .forEach((t) => tags.add(t));
  }
  return Array.from(tags);
}

function cityBaseCoords(city: string): { lat?: number; lng?: number } {
  const key = slugify(city);
  const base = CITY_COORDS[key];
  return base ? { lat: base.lat, lng: base.lng } : {};
}

function deterministicOffset(
  memberId: string,
  baseLat: number,
  baseLng: number
): { lat: number; lng: number } {
  let hash = 0;
  for (let i = 0; i < memberId.length; i++) {
    hash = (hash * 31 + memberId.charCodeAt(i)) | 0;
  }
  const angle = ((hash % 360) * Math.PI) / 180;
  const radius = 0.006 + (Math.abs(hash) % 80) / 10000;
  return {
    lat: baseLat + Math.sin(angle) * radius,
    lng: baseLng + Math.cos(angle) * radius,
  };
}

function resolvePhotoUrl(
  clubId: string,
  memberId: string,
  photo: string
): { imageUrl: string; missingPhoto: boolean } {
  const trimmed = photo.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return { imageUrl: trimmed, missingPhoto: false };
  }
  const placeholder = memberImagePublicUrl(clubId, memberId);
  const empty =
    !trimmed ||
    /^\[photo\]$/i.test(trimmed) ||
    /^image$/i.test(trimmed);
  return { imageUrl: placeholder, missingPhoto: empty || Boolean(trimmed) };
}

export function validateClubMemberRow(
  row: ClubMemberCsvRow,
  details: ClubImportDetails
): ClubMemberRowPreview {
  const errors: ClubMemberImportIssue[] = [];
  const warnings: ClubMemberImportIssue[] = [];

  const handle = normalizeInstagramHandle(row.instagram);
  if (!handle) {
    errors.push({ code: "missing_instagram", field: "instagram" });
  } else if (!/^[\w.]+$/.test(handle)) {
    warnings.push({ code: "invalid_instagram", field: "instagram" });
  }

  const carModelText = row.carModel.trim();
  if (!carModelText) {
    errors.push({ code: "missing_car_model", field: "car model" });
  }

  const clubId = details.clubId.trim();
  const memberId = handle ? memberIdFromHandle(clubId, handle) : `${clubId}-row-${row.rowNumber}`;
  const { city, country } = parseLocation(row.location, {
    city: details.city.trim(),
    country: details.country.trim() || "Germany",
  });

  if (!row.location.trim()) {
    warnings.push({ code: "missing_location", field: "location" });
  }

  const car = parseCarFromModel(carModelText);
  if (car.unknownMake && carModelText) {
    warnings.push({ code: "unknown_car_make", field: "car model" });
  }

  const { imageUrl, missingPhoto } = resolvePhotoUrl(clubId, memberId, row.photo);
  if (missingPhoto) {
    warnings.push({ code: "missing_photo", field: "photo" });
  }

  const status: ClubMemberRowPreview["status"] =
    errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "valid";

  return {
    rowNumber: row.rowNumber,
    instagramHandle: handle,
    displayName: handle ? `@${handle}` : "",
    carName: car.carName,
    carMake: car.carMake,
    carModel: car.carModel,
    city,
    country,
    memberId,
    imageUrl,
    instagramUrl: handle ? instagramProfileUrl(handle) : "",
    status,
    warnings,
    errors,
  };
}

export function validateClubMemberRows(
  rows: ClubMemberCsvRow[],
  details: ClubImportDetails
): ClubMemberRowPreview[] {
  return rows.map((row) => validateClubMemberRow(row, details));
}

export function summarizeClubMemberImport(previews: ClubMemberRowPreview[]) {
  return {
    total: previews.length,
    valid: previews.filter((p) => p.status === "valid").length,
    warning: previews.filter((p) => p.status === "warning").length,
    error: previews.filter((p) => p.status === "error").length,
    importable: previews.filter((p) => p.status !== "error").length,
  };
}

export function buildClubFromDetails(
  details: ClubImportDetails,
  memberCount: number
): Club {
  const clubId = details.clubId.trim();
  const now = new Date().toISOString();
  const coords = cityBaseCoords(details.city);
  const vehicleTypes = parseCommaList(details.vehicleTypes);
  const primaryBrands = parseCommaList(details.primaryBrands);
  const tags = parseCommaList(details.tags);

  const instagram = details.instagram.trim();
  const instagramUrl =
    instagram && !instagram.startsWith("http")
      ? instagramProfileUrl(normalizeInstagramHandle(instagram))
      : instagram || undefined;

  return {
    id: clubId,
    slug: clubId,
    name: details.clubName.trim(),
    type: "mixed",
    category: "car_club",
    status: "approved",
    city: details.city.trim(),
    country: details.country.trim() || "Germany",
    area: details.area.trim() || undefined,
    description: details.description.trim() || `${details.clubName.trim()} car club.`,
    shortDescription:
      details.description.trim().slice(0, 160) ||
      `${details.clubName.trim()} — local car community.`,
    instagram: instagramUrl,
    website: details.website.trim() || undefined,
    memberCount,
    verified: false,
    featured: true,
    tags: tags.length > 0 ? tags : undefined,
    vehicleTypes: vehicleTypes.length > 0 ? vehicleTypes : undefined,
    primaryBrands: primaryBrands.length > 0 ? primaryBrands : undefined,
    coverImageUrl: `/data/clubs/${clubId}/cover.webp`,
    imageUrl: `/data/clubs/${clubId}/cover.webp`,
    lat: coords.lat,
    lng: coords.lng,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildClubMemberFromPreview(
  preview: ClubMemberRowPreview,
  details: ClubImportDetails
): ClubMember | null {
  if (preview.status === "error" || !preview.instagramHandle) return null;

  const clubId = details.clubId.trim();
  const clubName = details.clubName.trim();
  const now = new Date().toISOString();
  const base = cityBaseCoords(preview.city);
  let lat = base.lat;
  let lng = base.lng;
  if (lat != null && lng != null) {
    const offset = deterministicOffset(preview.memberId, lat, lng);
    lat = offset.lat;
    lng = offset.lng;
  }

  const memberTags = buildTags(preview.carMake, preview.carModel, preview.carName);

  return {
    id: preview.memberId,
    clubId,
    clubName,
    displayName: preview.displayName,
    instagramHandle: preview.instagramHandle,
    instagram: preview.instagramUrl,
    status: "approved",
    city: preview.city,
    country: preview.country,
    area: details.area.trim() || undefined,
    lat,
    lng,
    carName: preview.carName,
    carMake: preview.carMake,
    carModel: preview.carModel,
    buildSummary: `${clubName} member car profile.`,
    buildTags: memberTags,
    imageUrl: preview.imageUrl,
    avatarUrl: preview.imageUrl.startsWith("/data/")
      ? preview.imageUrl
      : preview.imageUrl,
    role: "member",
    verifiedByClub: false,
    featured: false,
    claimStatus: "unclaimed",
    claimedByUid: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function buildClubImportBundle(
  details: ClubImportDetails,
  rows: ClubMemberCsvRow[]
): { bundle: ClubImportBundle; previews: ClubMemberRowPreview[] } {
  const previews = validateClubMemberRows(rows, details);
  const members = previews
    .map((p) => buildClubMemberFromPreview(p, details))
    .filter((m): m is ClubMember => m != null);

  const club = buildClubFromDetails(details, members.length);
  return { bundle: { club, members }, previews };
}

export function clubImportBundleToJson(bundle: ClubImportBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function clubMembersToNormalizedCsv(members: ClubMember[]): string {
  const data = members.map((m) => ({
    id: m.id,
    instagram_handle: m.instagramHandle ?? "",
    display_name: m.displayName,
    car_name: m.carName ?? "",
    car_make: m.carMake ?? "",
    car_model: m.carModel ?? "",
    city: m.city,
    country: m.country,
    image_url: m.imageUrl ?? "",
    instagram_url: m.instagram ?? "",
  }));
  return Papa.unparse(data);
}

export function validateClubImportDetails(details: ClubImportDetails): string[] {
  const errors: string[] = [];
  const clubId = details.clubId.trim();
  if (!clubId) errors.push("Club ID is required.");
  else if (!/^[a-z0-9-]+$/.test(clubId)) {
    errors.push("Club ID must be lowercase letters, numbers, and dashes only.");
  }
  if (!details.clubName.trim()) errors.push("Club name is required.");
  if (!details.city.trim()) errors.push("City is required.");
  if (!details.country.trim()) errors.push("Country is required.");
  return errors;
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
