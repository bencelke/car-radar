import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ClubDetailHeader } from "@/components/clubs/ClubDetailHeader";
import { ClubEventsSection } from "@/components/clubs/ClubEventsSection";
import { ClubMembersSection } from "@/components/clubs/ClubMembersSection";
import { ClubNearbyShopsSection } from "@/components/clubs/ClubNearbyShopsSection";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";
import { getApprovedEvents } from "@/lib/repositories/events";
import { getMembersByClubId } from "@/lib/repositories/club-members";
import { getClubById, getClubBySlug } from "@/lib/repositories/clubs";
import { getApprovedShops } from "@/lib/repositories/shops";
import { getApprovedCommunityZones } from "@/lib/repositories/community-zones";
import { CorrectionLink } from "@/components/detail/CorrectionLink";
import { RelatedSection } from "@/components/detail/RelatedSection";
import { RelatedEntityList } from "@/components/detail/RelatedEntityList";

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
    description: `${club.name} — ${club.type} in ${club.city}. ${club.description}`,
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
    <PageShell className="space-y-6">
      <ClubDetailHeader club={club} />
      <ClubMembersSection club={club} members={members} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ClubEventsSection club={club} events={relatedEvents} />
        <ClubNearbyShopsSection club={club} shops={nearbyShops} />
      </div>
      {clubZones.length > 0 ? (
        <RelatedSection title="Club areas">
          <RelatedEntityList
            items={clubZones.map((zone) => ({
              href: "/map",
              title: zone.name,
              subtitle: zone.description,
            }))}
          />
        </RelatedSection>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button
          nativeButton={false}
          render={
            <Link
              href={`/submit?type=member&club=${encodeURIComponent(club.name)}`}
            />
          }
          className="border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC]"
        >
          Submit a member
        </Button>
        <Button
          nativeButton={false}
          variant="outline"
          render={
            <Link
              href={`/submit?type=event&club=${encodeURIComponent(club.name)}`}
            />
          }
          className="border-white/[0.08] bg-[#151B24]/60 text-[#CBD5E1]"
        >
          Submit an event for this club
        </Button>
      </div>
      <CorrectionLink
        targetType="club"
        targetName={club.name}
        entityId={club.id}
      />
    </PageShell>
  );
}
