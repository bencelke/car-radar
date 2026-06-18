import Link from "next/link";
import { redirect } from "next/navigation";

import { ClubDashboard } from "@/components/clubs/ClubDashboard";
import { PageShell } from "@/components/layout/PageShell";
import { getPublishedAnnouncementsByClubId } from "@/lib/repositories/club-announcements";
import { getClubFollowerCount } from "@/lib/repositories/club-follows";
import { getMembersByClubId } from "@/lib/repositories/club-members";
import { getClubById, getClubBySlug } from "@/lib/repositories/clubs";
import { getEventsByClubId } from "@/lib/repositories/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function resolveClub(slug: string) {
  const bySlug = await getClubBySlug(slug);
  if (bySlug) return bySlug;
  return getClubById(slug);
}

export default async function ClubManagePage({ params }: PageProps) {
  const { slug } = await params;
  const club = await resolveClub(slug);
  if (!club) redirect(`/clubs/${slug}`);

  const [members, announcements, events, followerCount] = await Promise.all([
    getMembersByClubId(club.id),
    getPublishedAnnouncementsByClubId(club.id),
    getEventsByClubId(club.id),
    getClubFollowerCount(club.id),
  ]);

  return (
    <PageShell>
      <nav className="mb-3 px-4 lg:px-6">
        <Link
          href={`/clubs/${club.slug}`}
          className="text-xs font-medium text-[#3B82F6] hover:underline"
        >
          ← {club.name}
        </Link>
      </nav>
      <ClubDashboard
        club={club}
        members={members}
        initialAnnouncements={announcements}
        initialEvents={events}
        initialFollowerCount={followerCount}
      />
    </PageShell>
  );
}
