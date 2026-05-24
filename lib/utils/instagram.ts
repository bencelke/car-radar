import type { ClubMember } from "@/lib/types";

/** Strip leading @ and whitespace from a handle or display label. */
export function stripInstagramHandle(value: string): string {
  return value.trim().replace(/^@+/, "");
}

/** Format handle for UI as @handle */
export function formatInstagramHandle(handle: string): string {
  const bare = stripInstagramHandle(handle);
  return bare ? `@${bare}` : "";
}

/** Resolve bare handle from a member record (no @). */
export function resolveMemberInstagramHandle(member: {
  instagramHandle?: string;
  displayName?: string;
  instagram?: string;
  nickname?: string;
}): string | undefined {
  if (member.instagramHandle?.trim()) {
    return stripInstagramHandle(member.instagramHandle);
  }
  if (member.displayName?.trim()) {
    return stripInstagramHandle(member.displayName);
  }
  if (member.nickname?.trim()) {
    return stripInstagramHandle(member.nickname);
  }
  const ig = member.instagram?.trim();
  if (!ig) return undefined;
  try {
    const url = ig.startsWith("http") ? new URL(ig) : new URL(`https://${ig}`);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] ? stripInstagramHandle(parts[0]) : undefined;
  } catch {
    return stripInstagramHandle(ig);
  }
}

/** Primary member label for UI — always @handle when a handle exists. */
export function formatMemberHandleLabel(member: {
  instagramHandle?: string;
  displayName?: string;
  instagram?: string;
  nickname?: string;
}): string {
  const handle = resolveMemberInstagramHandle(member);
  if (handle) return formatInstagramHandle(handle);
  return member.displayName?.trim() || "Member";
}

/** https://instagram.com/{handle} — no API calls, external link only. */
export function memberInstagramUrl(member: {
  instagram?: string;
  instagramHandle?: string;
  displayName?: string;
}): string | undefined {
  if (member.instagram?.trim()) {
    const ig = member.instagram.trim();
    if (ig.startsWith("http")) return ig;
    if (ig.includes("instagram.com")) return ig.startsWith("//") ? `https:${ig}` : `https://${ig}`;
  }
  const handle = resolveMemberInstagramHandle(member);
  if (!handle) return undefined;
  return `https://instagram.com/${handle}`;
}

/** First character for avatar fallback (skips leading @). */
export function memberAvatarInitial(member: {
  instagramHandle?: string;
  displayName?: string;
}): string {
  const handle = resolveMemberInstagramHandle(member);
  const source = handle || stripInstagramHandle(member.displayName ?? "");
  return (source[0] ?? "?").toUpperCase();
}
