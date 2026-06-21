import { collection, getDocs, query, where } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { getApprovedClubMembers } from "@/lib/repositories/club-members";
import { getApprovedClubs } from "@/lib/repositories/clubs";
import { getUpcomingEvents } from "@/lib/repositories/events";
import { getPendingReports } from "@/lib/repositories/post-reports";
import { getApprovedShops } from "@/lib/repositories/shops";
import { getSubmissionsByStatus } from "@/lib/repositories/submissions";
import { getMockUserInvites } from "@/lib/mock-data/share-store";
import type { AdminDashboardMetrics } from "@/lib/types/admin";
import type {
  CarEvent,
  CarShop,
  Club,
  ClubMember,
  UserInvite,
  UserProfile,
} from "@/lib/types";

export type AdminOverviewStats = {
  clubCount: number;
  memberCount: number;
  upcomingEventCount: number;
  shopCount: number;
  pendingSubmissionCount: number;
};

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const metrics = await getAdminDashboardMetrics();
  return {
    clubCount: metrics.clubCount,
    memberCount: metrics.memberCount,
    upcomingEventCount: metrics.upcomingEventCount,
    shopCount: metrics.shopCount,
    pendingSubmissionCount: metrics.pendingSubmissionCount,
  };
}

export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [
    clubs,
    members,
    events,
    shops,
    submissions,
    usersResult,
    reportsResult,
    invitesResult,
  ] = await Promise.all([
    getClubsForAdmin(),
    getMembersForAdmin(),
    getEventsForAdmin(),
    getShopsForAdmin(),
    getSubmissionsByStatus("pending"),
    getUsersForAdmin().then((rows) => ({ ok: true as const, rows })).catch(() => ({ ok: false as const, rows: [] as UserProfile[] })),
    getPendingReports().then((rows) => ({ ok: true as const, rows })).catch(() => ({ ok: false as const, rows: [] as Awaited<ReturnType<typeof getPendingReports>> })),
    getInvitesForAdmin().then((rows) => ({ ok: true as const, rows })).catch(() => ({ ok: false as const, rows: [] as UserInvite[] })),
  ]);

  const now = Date.now();
  const upcomingEventCount = events.filter(
    (e) => new Date(e.startTime).getTime() >= now
  ).length;

  const pendingClaims = members.filter((m) => m.claimStatus === "pending");
  const unclaimedMembers = members.filter(
    (m) => !m.claimStatus || m.claimStatus === "unclaimed"
  );
  const clubsMissingOwner = clubs.filter((c) => !c.ownerUid);
  const clubsMissingLogo = clubs.filter(
    (c) => !c.imageUrl && !c.coverImageUrl
  );
  const membersMissingImage = members.filter(
    (m) => !m.imageUrl && !m.avatarUrl
  );
  const activeInvites = invitesResult.rows.filter((i) => i.status === "active");

  return {
    clubCount: clubs.length,
    memberCount: members.length,
    upcomingEventCount,
    shopCount: shops.length,
    pendingSubmissionCount: submissions.length,
    userCount: usersResult.ok ? usersResult.rows.length : null,
    pendingReportCount: reportsResult.ok ? reportsResult.rows.length : null,
    pendingClaimCount: pendingClaims.length,
    unclaimedMemberCount: unclaimedMembers.length,
    clubsMissingOwnerCount: clubsMissingOwner.length,
    clubsMissingLogoCount: clubsMissingLogo.length,
    membersMissingImageCount: membersMissingImage.length,
    activeInviteCount: invitesResult.ok ? activeInvites.length : null,
  };
}

export async function getClubsForAdmin(): Promise<Club[]> {
  if (!db) return getApprovedClubs();

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.clubs));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as Club)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return getApprovedClubs();
  }
}

export async function getMembersForAdmin(clubId?: string): Promise<ClubMember[]> {
  if (!db) {
    const members = await getApprovedClubMembers();
    return clubId ? members.filter((m) => m.clubId === clubId) : members;
  }

  try {
    const base = clubId
      ? query(
          collection(db, COLLECTIONS.clubMembers),
          where("clubId", "==", clubId)
        )
      : collection(db, COLLECTIONS.clubMembers);
    const snap = await getDocs(base);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as ClubMember)
      .filter((m) => m.status !== "archived")
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  } catch {
    const members = await getApprovedClubMembers();
    return clubId ? members.filter((m) => m.clubId === clubId) : members;
  }
}

export async function getEventsForAdmin(): Promise<CarEvent[]> {
  if (!db) return getUpcomingEvents();

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.carEvents));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as CarEvent)
      .filter((e) => e.status !== "archived")
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
  } catch {
    return getUpcomingEvents();
  }
}

export async function getShopsForAdmin(): Promise<CarShop[]> {
  if (!db) return getApprovedShops();

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.carShops));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as CarShop)
      .filter((s) => s.status !== "archived")
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return getApprovedShops();
  }
}

export async function getUsersForAdmin(): Promise<UserProfile[]> {
  if (!db) return [];

  const snap = await getDocs(collection(db, COLLECTIONS.users));
  return snap.docs
    .map((d) => ({ uid: d.id, ...d.data() }) as UserProfile)
    .sort((a, b) =>
      (a.displayName ?? a.email ?? a.uid ?? "").localeCompare(
        b.displayName ?? b.email ?? b.uid ?? ""
      )
    );
}

export async function getInvitesForAdmin(): Promise<UserInvite[]> {
  if (!db) return getMockUserInvites();

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.userInvites));
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as UserInvite)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  } catch {
    return getMockUserInvites();
  }
}

export async function getClaimsForAdmin(): Promise<ClubMember[]> {
  const members = await getMembersForAdmin();
  return members.filter(
    (m) => m.claimStatus && m.claimStatus !== "unclaimed"
  );
}

export async function getPendingClaimsForAdmin(): Promise<ClubMember[]> {
  const members = await getMembersForAdmin();
  return members.filter((m) => m.claimStatus === "pending");
}
