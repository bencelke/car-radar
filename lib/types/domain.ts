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
  sourceSubmissionId?: string;
};

export type CarShop = BasePlace & {
  /** Optional URL slug; falls back to slugified name or document id */
  slug?: string;
  services: string[];
  brandsSupported?: string[];
  rating?: number;
  reviewCount?: number;
  sponsorLevel?: SponsorLevel;
};

export type CarEvent = {
  id: string;
  /** Optional URL slug; falls back to slugified title or document id */
  slug?: string;
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
  sourceSubmissionId?: string;
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
  sourceSubmissionId?: string;
};

export type ClubMemberStatus = "pending" | "approved" | "rejected" | "archived";

/** Profile claim by a signed-in Firebase user (flow not implemented yet). */
export type MemberClaimStatus =
  | "unclaimed"
  | "pending"
  | "claimed"
  | "rejected";

export type MemberRole =
  | "member"
  | "club_owner"
  | "club_admin"
  | "founder"
  | "road_captain"
  | "photographer";

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
  shortDescription?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
  imageUrl?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  memberCount?: number;
  verified: boolean;
  featured?: boolean;
  tags?: string[];
  lat?: number;
  lng?: number;
  vehicleTypes?: string[];
  joinRequirements?: string;
  meetingStyle?: string;
  primaryBrands?: string[];
  foundedYear?: string;
  ownerName?: string;
  contactInstagram?: string;
  createdAt?: string;
  updatedAt?: string;
  sourceSubmissionId?: string;
  createdByUid?: string;
  updatedByUid?: string;
};

export type ClubMember = {
  id: string;
  clubId: string;
  clubName?: string;
  displayName: string;
  nickname?: string;
  status: ClubMemberStatus;
  city: string;
  country: string;
  area?: string;
  lat?: number;
  lng?: number;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  carName?: string;
  buildSummary?: string;
  buildTags?: string[];
  /** Bare Instagram username — no @ prefix; use formatMemberHandleLabel() in UI */
  instagramHandle?: string;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  imageUrl?: string;
  avatarUrl?: string;
  imageStoragePath?: string;
  imageUpdatedAt?: string;
  imageSizeBytes?: number;
  imageContentType?: string;
  role?: MemberRole;
  roleLabel?: string;
  verifiedByClub?: boolean;
  featured?: boolean;
  claimStatus?: MemberClaimStatus;
  claimedByUid?: string | null;
  createdAt?: string;
  updatedAt?: string;
  sourceSubmissionId?: string;
  createdByUid?: string;
  updatedByUid?: string;
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

export type SubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_changes";

export type CorrectionTargetType =
  | "shop"
  | "event"
  | "club"
  | "member"
  | "zone"
  | "other";

export type Submission = {
  id: string;
  type: SubmissionType;
  status: SubmissionStatus;
  name: string;
  category?: string;
  country?: string;
  city: string;
  area?: string;
  address?: string;
  /** @deprecated Use `address` */
  location?: string;
  lat?: number;
  lng?: number;
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
  sourceUrl?: string;
  description: string;
  tags?: string[];
  submittedByEmail?: string;
  submittedByUid?: string;
  permissionConfirmed?: boolean;
  createdAt: string;
  updatedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNote?: string;
  /** Set when submission is published to a listing collection */
  approvedEntityId?: string;
  /** Short collection slug: shops | events | clubs | members */
  publishedCollection?: string;
  services?: string[];
  brandsSupported?: string[];
  startTime?: string;
  endTime?: string;
  organizerName?: string;
  organizerInstagram?: string;
  clubType?: string;
  memberCountEstimate?: number;
  clubName?: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  carName?: string;
  buildSummary?: string;
  buildTags?: string[];
  targetType?: CorrectionTargetType;
  targetName?: string;
  correctionDetails?: string;
  importSource?: string;
  importedAt?: string;
};

export type CreateSubmissionInput = Omit<
  Submission,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export type UserRole = "admin" | "user";

/** Image metadata only — binary lives in Firebase Storage */
export type ProfileImageFields = {
  avatarUrl?: string;
  imageUrl?: string;
  imageStoragePath?: string;
  imageUpdatedAt?: string;
  imageSizeBytes?: number;
  imageContentType?: string;
};

export type UserProfile = {
  uid?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
} & ProfileImageFields;
