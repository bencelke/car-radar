import { DEFAULT_AFTER_LOGIN_ROUTE } from "@/lib/config/routes";

/**
 * Public routes guests may browse without signing in.
 * Does not create Firebase anonymous accounts.
 */

const PUBLIC_EXACT = new Set([
  "/discover",
  "/login",
  "/map",
  "/clubs",
  "/events",
  "/members",
  "/shops",
  "/communities",
  "/feed",
  "/terms",
  "/privacy",
  "/support",
]);

const PUBLIC_PREFIXES = [
  "/clubs/",
  "/events/",
  "/members/",
  "/shops/",
  "/cities/",
];

const PROTECTED_PREFIXES = [
  "/login",
  "/profile",
  "/garage",
  "/admin",
  "/notifications",
  "/submit",
  "/following",
  "/invite/",
];

function normalizePathname(pathname: string): string {
  const path = pathname.trim();
  if (!path.startsWith("/")) return "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function sanitizeGuestPath(next?: string | null): string | null {
  if (!next || typeof next !== "string") return null;

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("/\\") || lower.includes("javascript:")) return null;

  try {
    const parsed = new URL(trimmed, "https://shiftit.local");
    if (parsed.origin !== "https://shiftit.local") return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
  } catch {
    return null;
  }
}

export function isPublicGuestRoute(pathname: string): boolean {
  const path = normalizePathname(pathname.split("?")[0] ?? pathname);

  for (const blocked of PROTECTED_PREFIXES) {
    if (path === blocked || path.startsWith(blocked)) return false;
  }

  if (path.includes("/manage")) return false;

  if (PUBLIC_EXACT.has(path)) return true;

  return PUBLIC_PREFIXES.some(
    (prefix) => path === prefix.slice(0, -1) || path.startsWith(prefix)
  );
}

/** Guest destination: validated public `next` or home. */
export function resolveGuestDestination(next?: string | null): string {
  const sanitized = sanitizeGuestPath(next);
  if (sanitized && isPublicGuestRoute(sanitized)) {
    return sanitized;
  }
  return DEFAULT_AFTER_LOGIN_ROUTE;
}
