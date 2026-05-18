export type ListingStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "archived";

export type PlaceCategory =
  | "tuning"
  | "turbo"
  | "wheels"
  | "detailing"
  | "wrap_tint"
  | "club"
  | "event"
  | "vendor"
  | "dealership"
  | "audio"
  | "tires"
  | "other";

export type SponsorLevel = "free" | "verified" | "featured" | "sponsor";

export type BasePlace = {
  id: string;
  name: string;
  category: PlaceCategory;
  status: ListingStatus;
  city: string;
  country: string;
  address?: string;
  lat?: number;
  lng?: number;
  description: string;
  instagram?: string;
  website?: string;
  phone?: string;
  imageUrl?: string;
  verified: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CarShop = BasePlace & {
  services: string[];
  brandsSupported?: string[];
  rating?: number;
  reviewCount?: number;
  sponsorLevel?: SponsorLevel;
};

export type CarEvent = {
  id: string;
  title: string;
  type: string;
  status: ListingStatus;
  city: string;
  country: string;
  address?: string;
  lat?: number;
  lng?: number;
  description: string;
  startTime: string;
  endTime?: string;
  organizerName?: string;
  organizerInstagram?: string;
  sourceUrl?: string;
  imageUrl?: string;
  verified: boolean;
  featured?: boolean;
  interestedCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

/** @deprecated Prefer `Club` for new code; kept for dashboard/repository compatibility */
export type Community = {
  id: string;
  name: string;
  type: string;
  status: ListingStatus;
  city: string;
  country: string;
  description: string;
  instagram?: string;
  website?: string;
  imageUrl?: string;
  memberCount?: number;
  verified: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ClubMemberStatus = "pending" | "approved" | "rejected" | "archived";

export type Club = {
  id: string;
  name: string;
  slug: string;
  type: string;
  category?: string;
  status: ListingStatus;
  city: string;
  country: string;
  area?: string;
  description: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
  imageUrl?: string;
  logoUrl?: string;
  memberCount?: number;
  verified: boolean;
  featured?: boolean;
  tags?: string[];
  lat?: number;
  lng?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ClubMember = {
  id: string;
  clubId: string;
  displayName: string;
  nickname?: string;
  status: ClubMemberStatus;
  city: string;
  country: string;
  area?: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  carName?: string;
  buildSummary?: string;
  buildTags?: string[];
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  verifiedByClub?: boolean;
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CommunityZone = {
  id: string;
  name: string;
  communityId?: string;
  type: string;
  status: ListingStatus;
  city: string;
  country: string;
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number;
  description: string;
  instagram?: string;
  website?: string;
  verified: boolean;
  confidenceScore?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SubmissionType =
  | "shop"
  | "event"
  | "community"
  | "club"
  | "member"
  | "correction";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type Submission = {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  name: string;
  category?: string;
  city: string;
  country?: string;
  location?: string;
  description: string;
  instagram?: string;
  website?: string;
  submittedByEmail?: string;
  clubName?: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  buildTags?: string;
  permissionConfirmed?: boolean;
  createdAt: string;
};

export type CreateSubmissionInput = {
  type: SubmissionType;
  name: string;
  category?: string;
  city: string;
  country?: string;
  location?: string;
  description: string;
  instagram?: string;
  website?: string;
  submittedByEmail?: string;
  clubName?: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  buildTags?: string;
  permissionConfirmed?: boolean;
};
