/**
 * Client-safe provider availability flags.
 * Facebook App Secret must never appear in NEXT_PUBLIC_* env vars.
 */

export function isFacebookAuthEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_FACEBOOK_AUTH_ENABLED;
  if (flag === "false") return false;
  if (flag === "true") return true;
  return process.env.NODE_ENV === "development";
}
