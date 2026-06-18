import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClubDetailView } from "@/components/clubs/ClubDetailView";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { getPublishedAnnouncementsByClubId } from "@/lib/repositories/club-announcements";
import { getClubFollowerCount } from "@/lib/repositories/club-follows";
import { getMembersByClubId } from "@/lib/repositories/club-members";
import { getClubById, getClubBySlug } from "@/lib/repositories/clubs";
import { getApprovedEvents, getEventsByClubId } from "@/lib/repositories/events";
import { getApprovedShops } from "@/lib/repositories/shops";
import { getApprovedCommunityZones } from "@/lib/repositories/community-zones";
import { buildShareMetadata } from "@/lib/share/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function resolveClub(slug: string) {
  const bySlug = await getClubBySlug(slug);
  if (bySlug) return bySlug;
  return getClubById(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const club = await resolveClub(slug);
  if (!club) return { title: "Club not found" };
  return buildShareMetadata({
    title: `${club.name} | Car Club in ${club.city} | ${brand.appName}`,
    description:
      club.shortDescription ??
      `${club.name} — ${club.type} in ${club.city}. ${club.description}`,
    path: `/clubs/${club.slug || slug}`,
  });
}

export default async function ClubDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const club = await resolveClub(slug);
  if (!club) notFound();

  const [members, clubEvents, allShops, allZones, announcements, followerCount] =
    await Promise.all([
      getMembersByClubId(club.id),
      getEventsByClubId(club.id),
      getApprovedShops(),
      getApprovedCommunityZones(),
      getPublishedAnnouncementsByClubId(club.id),
      getClubFollowerCount(club.id),
    ]);

  const clubZones = allZones.filter((z) => z.communityId === club.id);

  const relatedEvents =
    clubEvents.length > 0
      ? clubEvents.filter(
          (e) => e.status === "approved" || e.status === "cancelled"
        )
      : (await getApprovedEvents()).filter(
          (e) =>
            e.city === club.city ||
            e.organizerName?.toLowerCase().includes(club.name.toLowerCase())
        );

  const nearbyShops = allShops.filter(
    (s) => s.city === club.city || s.city === club.area
  );

  return (
    <PageShell>
      <nav className="mb-3">
        <Link
          href="/clubs"
          className="inline-block text-xs font-medium text-[#3B82F6] hover:underline"
        >
          ← Clubs
        </Link>
      </nav>
      <ClubDetailView
        club={club}
        members={members}
        events={relatedEvents}
        shops={nearbyShops}
        zones={clubZones}
        announcements={announcements}
        followerCount={followerCount}
      />
    </PageShell>
  );
}
