import { DEFAULT_AFTER_LOGIN_ROUTE, ROUTES } from "@/lib/config/routes";
import { sanitizeNextPath } from "@/lib/auth/sanitize-next-path";
import type { UserProfile } from "@/lib/types";

export type PostLoginNavigationInput = {
  /** Raw `next` query, social redirect target, or stored post-auth path. */
  nextUrl?: string | null;
  profile?: UserProfile | null;
};

/** Whether the user should finish basic profile identity before browsing. */
export function needsProfileOnboarding(
  profile: UserProfile | null | undefined
): boolean {
  if (!profile) return false;
  const hasName = Boolean(
    profile.displayName?.trim() || profile.publicName?.trim()
  );
  return !hasName;
}

/** Safe in-app destination after authentication. */
export function resolvePostLoginDestination(
  input: PostLoginNavigationInput
): string {
  const explicitNext = input.nextUrl?.trim();

  if (explicitNext) {
    return sanitizeNextPath(explicitNext);
  }

  if (needsProfileOnboarding(input.profile)) {
    return ROUTES.profile;
  }

  return DEFAULT_AFTER_LOGIN_ROUTE;
}

/** Dev-only auth navigation logs (never shown in UI). */
export function logPostLoginNavigation(
  event: string,
  details: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "production") return;
  console.info(`[CarRadar][auth] ${event}`, details);
}
