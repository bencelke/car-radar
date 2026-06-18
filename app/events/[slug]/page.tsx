import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventDetailView } from "@/components/detail/EventDetailView";
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

  return (
    <PageShell>
      <Link
        href="/events"
        className="mb-4 inline-block text-xs text-[#3B82F6] hover:underline"
      >
        ← Events
      </Link>
      <EventDetailView
        event={event}
        relatedShops={relatedShops}
        relatedClubs={relatedClubs}
      />
    </PageShell>
  );
}
