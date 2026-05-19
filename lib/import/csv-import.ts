import Papa from "papaparse";

import type { RawSubmissionInput } from "@/lib/repositories/submission-sanitize";
import type { SubmissionType } from "@/lib/types";

const VALID_TYPES: SubmissionType[] = [
  "shop",
  "event",
  "club",
  "member",
  "correction",
];

export type CsvImportRow = {
  rowNumber: number;
  name: string;
  type: string;
  category: string;
  country: string;
  city: string;
  area: string;
  address: string;
  lat: string;
  lng: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  website: string;
  description: string;
  tags: string;
  source_url: string;
  status: string;
};

export type ImportIssueCode =
  | "missing_required"
  | "invalid_type"
  | "invalid_coordinates"
  | "no_social_link"
  | "csv_status_ignored";

export type ImportIssue = {
  code: ImportIssueCode;
  field?: string;
};

export type ImportRowValidation = {
  rowNumber: number;
  status: "valid" | "warning" | "error";
  issues: ImportIssue[];
  warnings: ImportIssue[];
  errors: ImportIssue[];
};

export type ParseCarRadarCsvResult = {
  rows: CsvImportRow[];
  parseErrors: string[];
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function cell(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function normalizeRow(
  raw: Record<string, unknown>,
  rowNumber: number
): CsvImportRow {
  const get = (...keys: string[]) => {
    for (const key of keys) {
      const v = cell(raw[key]);
      if (v) return v;
    }
    return "";
  };

  return {
    rowNumber,
    name: get("name"),
    type: get("type").toLowerCase(),
    category: get("category"),
    country: get("country"),
    city: get("city"),
    area: get("area"),
    address: get("address"),
    lat: get("lat"),
    lng: get("lng"),
    instagram: get("instagram"),
    tiktok: get("tiktok"),
    youtube: get("youtube"),
    website: get("website"),
    description: get("description"),
    tags: get("tags"),
    source_url: get("source_url", "sourceurl"),
    status: get("status").toLowerCase(),
  };
}

export function parseCarRadarCsv(csvText: string): ParseCarRadarCsvResult {
  const trimmed = csvText.trim();
  if (!trimmed) {
    return { rows: [], parseErrors: ["CSV is empty."] };
  }

  const result = Papa.parse<Record<string, unknown>>(trimmed, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader,
  });

  const parseErrors = result.errors.map(
    (e) => `Row ${e.row ?? "?"}: ${e.message}`
  );

  const rows = (result.data ?? []).map((raw, index) =>
    normalizeRow(raw, index + 2)
  );

  return { rows, parseErrors };
}

function parseCoord(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value.trim());
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function isValidLat(n: number): boolean {
  return n >= -90 && n <= 90;
}

function isValidLng(n: number): boolean {
  return n >= -180 && n <= 180;
}

function hasSocialOrSource(row: CsvImportRow): boolean {
  return Boolean(
    row.instagram ||
      row.tiktok ||
      row.youtube ||
      row.website ||
      row.source_url
  );
}

export function validateImportRow(row: CsvImportRow): ImportRowValidation {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];

  if (!row.name.trim()) {
    errors.push({ code: "missing_required", field: "name" });
  }
  if (!row.type.trim()) {
    errors.push({ code: "missing_required", field: "type" });
  } else if (!VALID_TYPES.includes(row.type as SubmissionType)) {
    errors.push({ code: "invalid_type", field: "type" });
  }
  if (!row.city.trim()) {
    errors.push({ code: "missing_required", field: "city" });
  }
  if (!row.description.trim()) {
    errors.push({ code: "missing_required", field: "description" });
  }

  if (row.lat.trim()) {
    const lat = parseCoord(row.lat);
    if (lat == null || !isValidLat(lat)) {
      errors.push({ code: "invalid_coordinates", field: "lat" });
    }
  }
  if (row.lng.trim()) {
    const lng = parseCoord(row.lng);
    if (lng == null || !isValidLng(lng)) {
      errors.push({ code: "invalid_coordinates", field: "lng" });
    }
  }

  if ((row.lat.trim() && !row.lng.trim()) || (!row.lat.trim() && row.lng.trim())) {
    warnings.push({ code: "invalid_coordinates", field: "lat/lng" });
  }

  if (!hasSocialOrSource(row)) {
    warnings.push({ code: "no_social_link" });
  }

  if (row.status && row.status !== "pending") {
    warnings.push({ code: "csv_status_ignored" });
  }

  const status: ImportRowValidation["status"] =
    errors.length > 0 ? "error" : warnings.length > 0 ? "warning" : "valid";

  return {
    rowNumber: row.rowNumber,
    status,
    issues: [...errors, ...warnings],
    warnings,
    errors,
  };
}

function parseMemberVehicle(name: string): {
  displayName: string;
  carHint?: string;
} {
  const parts = name.split("/").map((p) => p.trim());
  if (parts.length >= 2) {
    return { displayName: parts[0], carHint: parts.slice(1).join(" / ") };
  }
  return { displayName: name };
}

function memberClubName(row: CsvImportRow): string | undefined {
  const fromSource = row.source_url.trim();
  if (
    fromSource &&
    !fromSource.startsWith("http") &&
    !fromSource.includes(".")
  ) {
    return fromSource;
  }
  return undefined;
}

export function mapImportRowToSubmission(
  row: CsvImportRow
): RawSubmissionInput & { importSource: string; importedAt: string } {
  const now = new Date().toISOString();
  const type = row.type as SubmissionType;
  const lat = parseCoord(row.lat);
  const lng = parseCoord(row.lng);

  const base: RawSubmissionInput & {
    importSource: string;
    importedAt: string;
  } = {
    type,
    name: row.name.trim(),
    category: row.category.trim() || undefined,
    country: row.country.trim() || "Germany",
    city: row.city.trim(),
    area: row.area.trim() || undefined,
    address: row.address.trim() || undefined,
    lat: lat != null && isValidLat(lat) ? lat : undefined,
    lng: lng != null && isValidLng(lng) ? lng : undefined,
    instagram: row.instagram.trim() || undefined,
    tiktok: row.tiktok.trim() || undefined,
    youtube: row.youtube.trim() || undefined,
    website: row.website.trim() || undefined,
    description: row.description.trim(),
    tags: row.tags.trim() || undefined,
    sourceUrl:
      row.source_url.trim().startsWith("http") ? row.source_url.trim() : undefined,
    importSource: "csv",
    importedAt: now,
  };

  if (type === "member") {
    const { displayName, carHint } = parseMemberVehicle(row.name);
    return {
      ...base,
      name: displayName,
      clubName: memberClubName(row),
      buildSummary: row.description.trim(),
      carName: carHint,
      buildTags: row.tags.trim() || undefined,
      permissionConfirmed: true,
    };
  }

  if (type === "correction") {
    return {
      ...base,
      targetName: row.name.trim(),
      correctionDetails: row.description.trim(),
      targetType: "other",
    };
  }

  if (type === "club" && row.category) {
    return { ...base, clubType: row.category };
  }

  if (type === "shop" && row.tags) {
    return { ...base, services: row.tags };
  }

  return base;
}

export function validateImportRows(rows: CsvImportRow[]): ImportRowValidation[] {
  return rows.map(validateImportRow);
}

export function summarizeImport(validations: ImportRowValidation[]) {
  return {
    total: validations.length,
    valid: validations.filter((v) => v.status === "valid").length,
    warning: validations.filter((v) => v.status === "warning").length,
    error: validations.filter((v) => v.status === "error").length,
    importable: validations.filter((v) => v.status !== "error").length,
  };
}
