import { metaString } from "@/lib/map/map-utils";
import type { ClubMember, MapItem } from "@/lib/types";

/** Build a ClubMember-shaped object from a map member pin for shared UI. */
export function mapItemToClubMember(item: MapItem): ClubMember {
  return {
    id: metaString(item, "entityId") ?? item.id.replace(/^member-/, ""),
    clubId: metaString(item, "clubId") ?? "",
    clubName: metaString(item, "clubName") || undefined,
    displayName: metaString(item, "displayName") ?? item.title,
    instagramHandle: metaString(item, "instagramHandle") || undefined,
    status: "approved",
    city: item.city,
    country: item.country,
    area: item.area,
    carMake: metaString(item, "carMake") || undefined,
    carModel: metaString(item, "carModel") || undefined,
    carYear: metaString(item, "carYear") || undefined,
    carName: metaString(item, "carName") || undefined,
    buildSummary: item.description || metaString(item, "buildSummary") || undefined,
    buildTags: item.tags,
    instagram: item.instagram,
    imageUrl:
      metaString(item, "imageUrl") || metaString(item, "avatarUrl") || undefined,
    avatarUrl:
      metaString(item, "avatarUrl") || metaString(item, "imageUrl") || undefined,
    role: (metaString(item, "role") as ClubMember["role"]) ?? "member",
    verifiedByClub: item.verified,
  };
}
