/**
 * Firestore rejects documents containing `undefined` field values.
 * Strip them before setDoc / updateDoc.
 */

export function sanitizeFirestoreData<T extends Record<string, unknown>>(
  input: T
): T {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;

    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      out[key] = sanitizeFirestoreData(value as Record<string, unknown>);
      continue;
    }

    out[key] = value;
  }

  return out as T;
}

/** Trim string; empty → null (safe for optional Firestore fields). */
export function firestoreOptionalString(
  value: string | null | undefined
): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed || null;
}
