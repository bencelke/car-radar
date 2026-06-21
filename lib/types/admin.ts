/** Admin UI filter/status helpers — not Firestore document types. */
export type AdminLoadState = "idle" | "loading" | "ready" | "error";

export type AdminMetricValue = number | null;

export type AdminDashboardMetrics = {
  clubCount: number;
  memberCount: number;
  upcomingEventCount: number;
  shopCount: number;
  pendingSubmissionCount: number;
  userCount: AdminMetricValue;
  pendingReportCount: AdminMetricValue;
  pendingClaimCount: AdminMetricValue;
  unclaimedMemberCount: AdminMetricValue;
  clubsMissingOwnerCount: AdminMetricValue;
  clubsMissingLogoCount: AdminMetricValue;
  membersMissingImageCount: AdminMetricValue;
  activeInviteCount: AdminMetricValue;
};

export type AdminClaimRow = {
  id: string;
  type: "profile" | "club_owner" | "club_manager" | "business" | "event_organizer";
  targetLabel: string;
  targetId: string;
  requesterUid?: string;
  claimStatus: string;
  submittedAt?: string;
  verificationMethod?: string;
};
