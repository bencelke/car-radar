/** Lowercase slug: letters, numbers, dash only (dev file paths). */
const SAFE_SLUG_RE = /^[a-z0-9-]+$/;

export function isSafeDevSlug(value: string): boolean {
  const trimmed = value.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= 128 &&
    SAFE_SLUG_RE.test(trimmed) &&
    !trimmed.startsWith("-") &&
    !trimmed.endsWith("-")
  );
}
