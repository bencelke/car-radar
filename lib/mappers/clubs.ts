import type { Club, Community } from "@/lib/types";

export function clubToCommunity(club: Club): Community {
  return {
    id: club.id,
    name: club.name,
    type: club.type,
    status: club.status,
    city: club.city,
    country: club.country,
    description: club.description,
    instagram: club.instagram,
    website: club.website,
    imageUrl: club.imageUrl ?? club.logoUrl,
    memberCount: club.memberCount,
    verified: club.verified,
    featured: club.featured,
    createdAt: club.createdAt,
    updatedAt: club.updatedAt,
  };
}
