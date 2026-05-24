import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClubDetailView } from "@/components/clubs/ClubDetailView";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { getApprovedEvents } from "@/lib/repositories/events";
import { getMembersByClubId } from "@/lib/repositories/club-members";
import { getClubById, getClubBySlug } from "@/lib/repositories/clubs";
import { getApprovedShops } from "@/lib/repositories/shops";
import { getApprovedCommunityZones } from "@/lib/repositories/community-zones";

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
  return {
    title: `${club.name} | Car Club in ${club.city} | ${brand.appName}`,
    description:
      club.shortDescription ??
      `${club.name} — ${club.type} in ${club.city}. ${club.description}`,
  };
}

export default async function ClubDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const club = await resolveClub(slug);
  if (!club) notFound();

  const [members, allEvents, allShops, allZones] = await Promise.all([
    getMembersByClubId(club.id),
    getApprovedEvents(),
    getApprovedShops(),
    getApprovedCommunityZones(),
  ]);

  const clubZones = allZones.filter((z) => z.communityId === club.id);

  const relatedEvents = allEvents.filter(
    (e) =>
      e.city === club.city ||
      e.organizerName?.toLowerCase().includes(club.name.toLowerCase()) ||
      e.title.toLowerCase().includes(club.name.split(" ")[0].toLowerCase())
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
      />
    </PageShell>
  );
}
