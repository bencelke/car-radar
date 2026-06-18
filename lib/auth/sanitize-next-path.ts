import { brand } from "@/lib/config/brand";

const DEFAULT_PATH = brand.nav.profile.href;

/**
 * Allow only same-origin relative paths. Rejects external, protocol-relative,
 * and javascript: destinations.
 */
export function sanitizeNextPath(next?: string | null): string {
  if (!next || typeof next !== "string") return DEFAULT_PATH;

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_PATH;
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("/\\") || lower.includes("javascript:")) {
    return DEFAULT_PATH;
  }

  try {
    const parsed = new URL(trimmed, "https://shiftit.local");
    if (parsed.origin !== "https://shiftit.local") return DEFAULT_PATH;
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || DEFAULT_PATH;
  } catch {
    return DEFAULT_PATH;
  }
}
