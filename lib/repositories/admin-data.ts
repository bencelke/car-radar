import { collection, getDocs, query, where } from "firebase/firestore";

import { COLLECTIONS } from "@/lib/firebase/collections";
import { db } from "@/lib/firebase/client";
import { getApprovedClubMembers } from "@/lib/repositories/club-members";
import { getApprovedClubs } from "@/lib/repositories/clubs";
import { getUpcomingEvents } from "@/lib/repositories/events";
import { getSubmissionsByStatus } from "@/lib/repositories/submissions";
import type { CarEvent, Club, ClubMember } from "@/lib/types";

export type AdminOverviewStats = {
  clubCount: number;
  memberCount: number;
  upcomingEventCount: number;
  pendingSubmissionCount: number;
};

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const [clubs, members, events, submissions] = await Promise.all([
    getApprovedClubs(),
    getApprovedClubMembers(),
    getUpcomingEvents(),
    getSubmissionsByStatus("pending"),
  ]);

  return {
    clubCount: clubs.length,
    memberCount: members.length,
    upcomingEventCount: events.length,
    pendingSubmissionCount: submissions.length,
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
