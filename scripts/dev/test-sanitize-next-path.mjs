import assert from "node:assert/strict";
import { describe, it } from "node:test";

const DEFAULT_AFTER_LOGIN_ROUTE = "/";

function normalizePathname(pathname) {
  if (!pathname.startsWith("/")) return pathname;
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isBlockedPostLoginPath(pathname) {
  const path = normalizePathname(pathname);
  return path === "/login" || path.startsWith("/login/");
}

function sanitizeNextPath(next) {
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

describe("sanitizeNextPath", () => {
  it("defaults to home when next is missing", () => {
    assert.equal(sanitizeNextPath(null), "/");
    assert.equal(sanitizeNextPath(undefined), "/");
    assert.equal(sanitizeNextPath(""), "/");
  });

  it("allows safe internal paths", () => {
    assert.equal(sanitizeNextPath("/clubs"), "/clubs");
    assert.equal(
      sanitizeNextPath("/claim/wbn-bambam-84"),
      "/claim/wbn-bambam-84"
    );
    assert.equal(sanitizeNextPath("/clubs?tab=events"), "/clubs?tab=events");
  });

  it("rejects external and protocol-relative targets", () => {
    assert.equal(sanitizeNextPath("https://evil.com"), "/");
    assert.equal(sanitizeNextPath("//evil.com"), "/");
  });

  it("rejects redirect loops back to login", () => {
    assert.equal(sanitizeNextPath("/login"), "/");
    assert.equal(sanitizeNextPath("/login?next=/clubs"), "/");
    assert.equal(sanitizeNextPath("/login/"), "/");
  });
});
