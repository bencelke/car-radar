export type ListingStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "archived";

/** Event lifecycle includes public cancellation without deletion. */
export type EventStatus =
  | "draft"
  | "pending"
  | "approved"
  | "cancelled"
  | "archived";

export type AnnouncementType =
  | "meet"
  | "route_change"
  | "cancellation"
  | "sponsor"
  | "club_news"
  | "general";

export type AnnouncementStatus = "draft" | "published" | "archived";

export type EventRsvpStatus = "going" | "interested" | "not_going";

export type CheckInStatus = "closed" | "open";

export type EventCheckInStatus = "checked_in" | "removed";

export type EventCheckInMethod = "qr" | "organizer_manual";

export type NotificationType =
  | "club_announcement"
  | "club_event_created"
  | "event_updated"
  | "event_cancelled"
  | "event_checkin_open"
  | "event_reminder"
  | "club_followed"
  | "garage_followed"
  | "garage_build_updated"
  | "system";

export type NotificationStatus = "unread" | "read" | "archived";

export type NotificationPreferences = {
  clubAnnouncements?: boolean;
  clubEvents?: boolean;
  eventUpdates?: boolean;
  eventCancellations?: boolean;
  checkInAlerts?: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  clubAnnouncements: true,
  clubEvents: true,
  eventUpdates: true,
  eventCancellations: true,
  checkInAlerts: true,
};

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
  slug?: string;
  clubId?: string;
  clubName?: string;
  title: string;
  type: string;
  status: EventStatus;
  city: string;
  country: string;
  area?: string;
  address?: string;
  lat?: number;
  lng?: number;
  description: string;
  startTime: string;
  endTime?: string;
  timezone?: string;
  meetingRoute?: string;
  maxAttendance?: number;
  organizerName?: string;
  organizerInstagram?: string;
  sourceUrl?: string;
  imageUrl?: string;
  verified: boolean;
  featured?: boolean;
  interestedCount?: number;
  goingCount?: number;
  notGoingCount?: number;
  checkedInCount?: number;
  checkInEnabled?: boolean;
  checkInStatus?: CheckInStatus;
  /** SHA-256 hash of active token — raw token never stored */
  checkInTokenHash?: string;
  checkInTokenExpiresAt?: string;
  checkInOpenedAt?: string;
  checkInClosedAt?: string;
  checkInOpenedByUid?: string;
  createdByUid?: string;
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
  ownerUid?: string;
  adminUids?: string[];
  managerUids?: string[];
  followerCount?: number;
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
  horsepower?: number;
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

export type ClubFollow = {
  id: string;
  userId: string;
  clubId: string;
  createdAt: string;
};

export type ClubAnnouncement = {
  id: string;
  clubId: string;
  authorUid: string;
  authorDisplayName?: string;
  title: string;
  body: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  relatedEventId?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
};

export type EventRsvp = {
  id: string;
  eventId: string;
  userId: string;
  status: EventRsvpStatus;
  createdAt: string;
  updatedAt?: string;
};

export type EventCheckIn = {
  id: string;
  eventId: string;
  userId: string;
  memberProfileId?: string;
  status: EventCheckInStatus;
  method: EventCheckInMethod;
  checkedInAt: string;
  removedAt?: string;
  checkedInByUid?: string;
  displayNameSnapshot?: string;
  avatarUrlSnapshot?: string;
  clubNameSnapshot?: string;
};

export type AppNotification = {
  id: string;
  recipientUid: string;
  type: NotificationType;
  title: string;
  body: string;
  status: NotificationStatus;
  clubId?: string;
  eventId?: string;
  announcementId?: string;
  memberId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  readAt?: string;
  archivedAt?: string;
};

export type GarageVisibility = "public" | "club_only" | "private";

export type GarageProfileStatus = "draft" | "published" | "archived";

export type GarageCarStatus = "draft" | "published" | "archived";

export type BuildStage =
  | "stock"
  | "stage_1"
  | "stage_2"
  | "stage_3"
  | "track"
  | "show"
  | "custom";

export type GarageModCategory =
  | "engine"
  | "turbo"
  | "exhaust"
  | "intake"
  | "tune"
  | "suspension"
  | "wheels"
  | "tires"
  | "brakes"
  | "body"
  | "interior"
  | "audio"
  | "lighting"
  | "other";

export type GarageModStatus = "planned" | "ordered" | "installed" | "removed";

export type BuildProgressType =
  | "mod_added"
  | "mod_installed"
  | "dyno_update"
  | "photo_update"
  | "milestone"
  | "general";

export type GarageProfile = {
  id: string;
  ownerUid: string;
  memberProfileId?: string;
  displayName: string;
  instagramHandle?: string;
  instagram?: string;
  clubId?: string;
  clubName?: string;
  city?: string;
  area?: string;
  country?: string;
  visibility: GarageVisibility;
  status: GarageProfileStatus;
  primaryCarId?: string;
  followerCount?: number;
  followingCount?: number;
  lastActivityAt?: string;
  featured?: boolean;
  trendingScore?: number;
  createdAt: string;
  updatedAt?: string;
};

export type GarageCar = {
  id: string;
  garageId: string;
  ownerUid: string;
  make: string;
  model: string;
  year?: string;
  trim?: string;
  generation?: string;
  drivetrain?: string;
  transmission?: string;
  engine?: string;
  horsepower?: number;
  torqueNm?: number;
  buildStage?: BuildStage;
  buildSummary?: string;
  primaryImageUrl?: string;
  primaryImageStoragePath?: string;
  imageSizeBytes?: number;
  imageContentType?: string;
  imageUpdatedAt?: string;
  tags?: string[];
  status: GarageCarStatus;
  createdAt: string;
  updatedAt?: string;
};

export type GarageMod = {
  id: string;
  carId: string;
  ownerUid: string;
  category: GarageModCategory;
  name: string;
  brand?: string;
  description?: string;
  installedAt?: string;
  status: GarageModStatus;
  createdAt: string;
  updatedAt?: string;
};

export type BuildProgressUpdate = {
  id: string;
  carId: string;
  ownerUid: string;
  title: string;
  body?: string;
  type: BuildProgressType;
  relatedModId?: string;
  horsepowerSnapshot?: number;
  createdAt: string;
  updatedAt?: string;
};

export type GarageFollow = {
  id: string;
  followerUid: string;
  garageId: string;
  garageOwnerUid: string;
  createdAt: string;
};

export type GarageFeedItemType =
  | "garage_created"
  | "garage_published"
  | "photo_updated"
  | "mod_added"
  | "mod_installed"
  | "horsepower_updated"
  | "build_stage_updated"
  | "milestone"
  | "progress_update";

export type GarageFeedVisibility = "public" | "followers";

export type GarageFeedItem = {
  id: string;
  garageId: string;
  carId?: string;
  ownerUid: string;
  type: GarageFeedItemType;
  title: string;
  body?: string;
  imageUrl?: string;
  relatedModId?: string;
  relatedUpdateId?: string;
  horsepowerSnapshot?: number;
  buildStageSnapshot?: string;
  visibility: GarageFeedVisibility;
  dedupeKey?: string;
  createdAt: string;
};

export type ShareEntityType = "garage" | "member" | "club" | "event" | "shop";

export type ShareLink = {
  id: string;
  entityType: ShareEntityType | "invite";
  entityId: string;
  createdByUid?: string;
  campaign?: string;
  source?: string;
  slug?: string;
  destinationUrl: string;
  createdAt: string;
  expiresAt?: string;
  clickCount?: number;
};

export type UserInviteType =
  | "join_shiftit"
  | "join_club"
  | "claim_profile"
  | "event_invite";

export type UserInviteStatus = "active" | "used" | "expired" | "cancelled";

export type UserInvite = {
  id: string;
  inviterUid: string;
  inviteType: UserInviteType;
  clubId?: string;
  eventId?: string;
  memberId?: string;
  targetInstagramHandle?: string;
  inviteCode: string;
  status: UserInviteStatus;
  createdAt: string;
  usedAt?: string;
  usedByUid?: string;
  expiresAt?: string;
};

export type ShareAnalyticsAction =
  | "share_opened"
  | "link_copied"
  | "native_share"
  | "card_downloaded"
  | "invite_opened"
  | "invite_used";

export type ShareAnalyticsEvent = {
  id: string;
  shareLinkId?: string;
  entityType: ShareEntityType | "invite";
  entityId: string;
  action: ShareAnalyticsAction;
  userId?: string;
  sessionId?: string;
  source?: string;
  campaign?: string;
  createdAt: string;
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
  authProviders?: string[];
  instagramHandle?: string;
  instagramUrl?: string;
  instagramVerificationStatus?: "unverified" | "pending" | "verified";
  role: UserRole;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  unreadNotificationCount?: number;
  lastNotificationAt?: string;
  notificationPreferences?: NotificationPreferences;
} & ProfileImageFields;
