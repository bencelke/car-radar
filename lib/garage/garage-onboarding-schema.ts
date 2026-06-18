import { normalizeUserInstagramInput } from "@/lib/auth/instagram-profile";
import type { BuildStage, GarageVisibility } from "@/lib/types";

export type GarageOnboardingStepIndex = 0 | 1 | 2 | 3 | 4;

export type GarageIdentityInput = {
  displayName: string;
  instagramHandle?: string;
  city?: string;
  area?: string;
  country?: string;
  visibility: GarageVisibility;
};

export type GarageCarInput = {
  make: string;
  model: string;
  year?: string;
  trim?: string;
  generation?: string;
  engine?: string;
  drivetrain?: string;
  transmission?: string;
};

export type GarageBuildInput = {
  horsepower?: string;
  torqueNm?: string;
  buildStage?: BuildStage | null;
  buildSummary?: string;
  tags?: string;
};

export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export type GarageValidationMessageKey =
  | "displayNameRequired"
  | "displayNameTooShort"
  | "displayNameTooLong"
  | "instagramInvalid"
  | "cityTooLong"
  | "areaTooLong"
  | "countryTooLong"
  | "makeRequired"
  | "modelRequired"
  | "makeTooLong"
  | "modelTooLong"
  | "yearInvalid"
  | "horsepowerInvalid"
  | "torqueInvalid"
  | "buildSummaryTooLong"
  | "tagsTooMany"
  | "tagTooLong";

const CURRENT_YEAR = new Date().getFullYear();

function trimOrUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePositiveInt(
  value: string | undefined,
  min: number,
  max: number
): number | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const num = Number(trimmed);
  if (!Number.isInteger(num) || num < min || num > max) return NaN;
  return num;
}

export function canSkipGarageStep(step: GarageOnboardingStepIndex): boolean {
  return step === 2 || step === 3;
}

export function validateGarageIdentity(
  input: GarageIdentityInput,
  options?: { validateOptionalFields?: boolean }
): FieldErrors<keyof GarageIdentityInput> {
  const errors: FieldErrors<keyof GarageIdentityInput> = {};
  const name = input.displayName.trim();

  if (!name) {
    errors.displayName = "displayNameRequired";
  } else if (name.length < 2) {
    errors.displayName = "displayNameTooShort";
  } else if (name.length > 50) {
    errors.displayName = "displayNameTooLong";
  }

  if (!options?.validateOptionalFields) {
    return errors;
  }

  const instagram = input.instagramHandle?.trim();
  if (instagram && !normalizeUserInstagramInput(instagram)) {
    errors.instagramHandle = "instagramInvalid";
  }
  if (input.city && input.city.trim().length > 80) {
    errors.city = "cityTooLong";
  }
  if (input.area && input.area.trim().length > 100) {
    errors.area = "areaTooLong";
  }
  if (input.country && input.country.trim().length > 80) {
    errors.country = "countryTooLong";
  }

  return errors;
}

export function validateGarageCar(
  input: GarageCarInput,
  options?: { validateOptionalFields?: boolean }
): FieldErrors<keyof GarageCarInput> {
  const errors: FieldErrors<keyof GarageCarInput> = {};
  const make = input.make.trim();
  const model = input.model.trim();

  if (!make) errors.make = "makeRequired";
  else if (make.length > 50) errors.make = "makeTooLong";

  if (!model) errors.model = "modelRequired";
  else if (model.length > 60) errors.model = "modelTooLong";

  if (!options?.validateOptionalFields) {
    return errors;
  }

  const year = input.year?.trim();
  if (year) {
    const num = Number(year);
    if (
      !Number.isInteger(num) ||
      num < 1900 ||
      num > CURRENT_YEAR + 1
    ) {
      errors.year = "yearInvalid";
    }
  }

  return errors;
}

export function validateGarageBuild(
  input: GarageBuildInput
): FieldErrors<keyof GarageBuildInput> {
  const errors: FieldErrors<keyof GarageBuildInput> = {};

  if (input.horsepower?.trim()) {
    const hp = parsePositiveInt(input.horsepower, 1, 5000);
    if (hp === undefined || Number.isNaN(hp)) {
      errors.horsepower = "horsepowerInvalid";
    }
  }

  if (input.torqueNm?.trim()) {
    const torque = parsePositiveInt(input.torqueNm, 1, 10000);
    if (torque === undefined || Number.isNaN(torque)) {
      errors.torqueNm = "torqueInvalid";
    }
  }

  if (input.buildSummary && input.buildSummary.length > 1000) {
    errors.buildSummary = "buildSummaryTooLong";
  }

  if (input.tags?.trim()) {
    const parsed = parseGarageTags(input.tags);
    if (parsed.length > 12) {
      errors.tags = "tagsTooMany";
    } else if (parsed.some((tag) => tag.length > 30)) {
      errors.tags = "tagTooLong";
    }
  }

  return errors;
}

export function hasGarageBuildInput(input: GarageBuildInput): boolean {
  return Boolean(
    input.horsepower?.trim() ||
      input.torqueNm?.trim() ||
      input.buildStage ||
      input.buildSummary?.trim() ||
      input.tags?.trim()
  );
}

export function parseGarageTags(raw: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of raw.split(",")) {
    const tag = part.trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
  }
  return tags;
}

export function sanitizeGarageIdentity(
  input: GarageIdentityInput
): GarageIdentityInput & { instagramHandle?: string } {
  const instagram = input.instagramHandle?.trim();
  const normalized = instagram
    ? normalizeUserInstagramInput(instagram)
    : null;

  return {
    displayName: input.displayName.trim(),
    instagramHandle: normalized?.handle,
    city: trimOrUndefined(input.city),
    area: trimOrUndefined(input.area),
    country: trimOrUndefined(input.country),
    visibility: input.visibility ?? "public",
  };
}

export function sanitizeGarageCarInput(input: GarageCarInput): GarageCarInput {
  return {
    make: input.make.trim(),
    model: input.model.trim(),
    year: trimOrUndefined(input.year),
    trim: trimOrUndefined(input.trim),
    generation: trimOrUndefined(input.generation),
    engine: trimOrUndefined(input.engine),
    drivetrain: trimOrUndefined(input.drivetrain),
    transmission: trimOrUndefined(input.transmission),
  };
}

export function sanitizeGarageBuildPatch(input: GarageBuildInput): {
  horsepower?: number;
  torqueNm?: number;
  buildStage?: BuildStage;
  buildSummary?: string;
  tags?: string[];
} {
  const patch: {
    horsepower?: number;
    torqueNm?: number;
    buildStage?: BuildStage;
    buildSummary?: string;
    tags?: string[];
  } = {};

  const hp = parsePositiveInt(input.horsepower, 1, 5000);
  if (hp !== undefined && !Number.isNaN(hp)) patch.horsepower = hp;

  const torque = parsePositiveInt(input.torqueNm, 1, 10000);
  if (torque !== undefined && !Number.isNaN(torque)) patch.torqueNm = torque;

  if (input.buildStage) patch.buildStage = input.buildStage;

  const summary = trimOrUndefined(input.buildSummary);
  if (summary) patch.buildSummary = summary;

  const tags = parseGarageTags(input.tags ?? "");
  if (tags.length > 0) patch.tags = tags;

  return patch;
}

export function isGarageIdentityValid(input: GarageIdentityInput): boolean {
  return Object.keys(validateGarageIdentity(input)).length === 0;
}

export function isGarageCarValid(input: GarageCarInput): boolean {
  return Object.keys(validateGarageCar(input)).length === 0;
}

export function isGarageReviewValid(
  identity: GarageIdentityInput,
  car: GarageCarInput
): boolean {
  return isGarageIdentityValid(identity) && isGarageCarValid(car);
}
