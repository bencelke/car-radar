import { DEFAULT_AFTER_LOGIN_ROUTE } from "@/lib/config/routes";

function normalizePathname(pathname: string): string {
  if (!pathname.startsWith("/")) return pathname;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isBlockedPostLoginPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return path === "/" || path === "/login" || path.startsWith("/login/");
}

/**
 * Allow only same-origin relative paths. Rejects external, protocol-relative,
 * javascript:, and post-login loops back to `/login`.
 */
export function sanitizeNextPath(next?: string | null): string {
  if (!next || typeof next !== "string") return DEFAULT_AFTER_LOGIN_ROUTE;

  const trimmed = next.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return DEFAULT_AFTER_LOGIN_ROUTE;
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("/\\") || lower.includes("javascript:")) {
    return DEFAULT_AFTER_LOGIN_ROUTE;
  }

  try {
    const parsed = new URL(trimmed, "https://shiftit.local");
    if (parsed.origin !== "https://shiftit.local") {
      return DEFAULT_AFTER_LOGIN_ROUTE;
    }

    if (isBlockedPostLoginPath(parsed.pathname)) {
      return DEFAULT_AFTER_LOGIN_ROUTE;
    }

    return (
      `${parsed.pathname}${parsed.search}${parsed.hash}` ||
      DEFAULT_AFTER_LOGIN_ROUTE
    );
  } catch {
    return DEFAULT_AFTER_LOGIN_ROUTE;
  }
}

/** Alias for post-login / `next` query sanitization. */
export function getSafeNextRoute(rawNext: string | null): string {
  return sanitizeNextPath(rawNext);
}
