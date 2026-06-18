import { createHash, randomBytes } from "node:crypto";

/** Active QR token lifetime (15 minutes). */
export const CHECK_IN_TOKEN_TTL_MS = 15 * 60 * 1000;

export function generateCheckInToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashCheckInToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function isCheckInTokenExpired(expiresAt: string | undefined): boolean {
  if (!expiresAt) return true;
  return Date.parse(expiresAt) <= Date.now();
}

export function checkInTokenExpiresAt(from = Date.now()): string {
  return new Date(from + CHECK_IN_TOKEN_TTL_MS).toISOString();
}

export function buildCheckInUrl(
  origin: string,
  eventSlug: string,
  token: string
): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/events/${encodeURIComponent(eventSlug)}/check-in?token=${encodeURIComponent(token)}`;
}
