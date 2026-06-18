import { stripInstagramHandle } from "@/lib/utils/instagram";

export type NormalizedInstagramProfile = {
  handle: string;
  url: string;
};

/** Normalize user-entered handle or URL for public profile display. */
export function normalizeUserInstagramInput(
  input: string
): NormalizedInstagramProfile | null {
  let value = input.trim();
  if (!value) return null;

  value = value.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  value = value.replace(/^@+/, "");
  value = value.split("?")[0]?.replace(/\/+$/, "") ?? "";

  const handle = stripInstagramHandle(value);
  if (!handle || !/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
    return null;
  }

  return {
    handle,
    url: `https://instagram.com/${handle}`,
  };
}
