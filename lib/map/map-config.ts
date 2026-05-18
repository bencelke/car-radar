export const MAPBOX_STYLE_DARK = "mapbox://styles/mapbox/dark-v11";

/** Future option: mapbox://styles/mapbox/navigation-night-v1 */
// export const MAPBOX_STYLE_STREETS_DARK_OPTION = "mapbox://styles/mapbox/navigation-night-v1";

export const MAPBOX_STYLE = MAPBOX_STYLE_DARK;

export const DEFAULT_CENTER = {
  lng: 7.7491,
  lat: 49.4401,
} as const;

export const DEFAULT_ZOOM = 10;

export const DASHBOARD_ZOOM = 9;

export const FLY_TO_ZOOM = 13;

export const DASHBOARD_FLY_TO_ZOOM = 12;

export type MapErrorCategory =
  | "missing-token"
  | "init-failed"
  | "auth"
  | "unknown";

/** Reads NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN; empty string counts as missing. */
export function getMapboxToken(): string | undefined {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) return undefined;
  const trimmed = token.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function hasMapboxToken(): boolean {
  return Boolean(getMapboxToken());
}

export function logMapboxTokenDiagnostic(): void {
  if (process.env.NODE_ENV !== "development") return;
  console.info(
    `[CarRadarMap] Mapbox token present: ${hasMapboxToken() ? "yes" : "no"}`
  );
}

export function classifyMapboxError(error: unknown): MapErrorCategory {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error ?? "");

  const lower = message.toLowerCase();

  if (
    lower.includes("unauthorized") ||
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("forbidden") ||
    (lower.includes("token") &&
      (lower.includes("invalid") ||
        lower.includes("expired") ||
        lower.includes("required"))) ||
    lower.includes("not authorized") ||
    lower.includes("domain")
  ) {
    return "auth";
  }

  return "unknown";
}
