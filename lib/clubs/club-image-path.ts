import type { Club } from "@/lib/types";

export type ClubDevImageKind = "cover" | "logo";

export function clubImageFileName(kind: ClubDevImageKind): string {
  return kind === "logo" ? "logo.webp" : "cover.webp";
}

export function clubPublicImagePath(clubId: string, kind: ClubDevImageKind): string {
  return `/data/clubs/${clubId}/${clubImageFileName(kind)}`;
}

export function clubImagePublicDiskPath(
  club: Pick<Club, "id">,
  kind: ClubDevImageKind
): string {
  return `public/data/clubs/${club.id}/${clubImageFileName(kind)}`;
}

/** Prefer cover, then legacy imageUrl, then logo */
export function clubCoverUrl(club: Club): string | undefined {
  const cover = club.coverImageUrl?.trim();
  const image = club.imageUrl?.trim();
  const logo = club.logoUrl?.trim();
  return cover || image || logo || undefined;
}
