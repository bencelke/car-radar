import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDetailView } from "@/components/detail/EventDetailView";
import { EventListBackLink } from "@/components/events/EventListBackLink";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { getApprovedClubs } from "@/lib/repositories/clubs";
import { getEventBySlug } from "@/lib/repositories/events";
import { getApprovedShops } from "@/lib/repositories/shops";
import { buildShareMetadata } from "@/lib/share/metadata";
import { getEntitySlug } from "@/lib/utils/slug";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function resolveEvent(slug: string) {
  return getEventBySlug(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await resolveEvent(slug);
  if (!event) return { title: "Event not found" };
  return buildShareMetadata({
    title: `${event.title} | Car Meet in ${event.city} | ${brand.appName}`,
    description: `${event.title} in ${event.city}. ${event.description}`,
    path: `/events/${getEntitySlug(event)}`,
  });
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await resolveEvent(slug);
  if (!event) notFound();

  const [allShops, allClubs] = await Promise.all([
    getApprovedShops(),
    getApprovedClubs(),
  ]);

  const relatedShops = allShops.filter((s) => s.city === event.city).slice(0, 8);
  const relatedClubs = allClubs
    .filter((c) => c.city === event.city)
    .slice(0, 8);

  const hostClub = event.clubId
    ? allClubs.find((c) => c.id === event.clubId) ?? null
    : null;

  return (
    <PageShell maxWidth="detail">
      <EventListBackLink />
      <EventDetailView
        event={event}
        relatedShops={relatedShops}
        relatedClubs={relatedClubs}
        hostClub={hostClub}
      />
    </PageShell>
  );
}
