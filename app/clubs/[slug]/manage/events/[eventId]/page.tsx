import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EventCheckInManager } from "@/components/events/EventCheckInManager";
import { PageShell } from "@/components/layout/PageShell";
import { getClubById } from "@/lib/repositories/clubs";
import { getEventRecord } from "@/lib/repositories/events";

type PageProps = {
  params: Promise<{ slug: string; eventId: string }>;
};

export default async function ClubEventManagePage({ params }: PageProps) {
  const { slug, eventId } = await params;
  const event = await getEventRecord(eventId);
  if (!event) notFound();

  const club = event.clubId ? await getClubById(event.clubId) : null;
  if (!club || club.slug !== slug) {
    redirect(`/clubs/${slug}/manage`);
  }

  return (
    <PageShell>
      <nav className="mb-4 px-4 lg:px-6">
        <Link
          href={`/clubs/${slug}/manage`}
          className="text-xs font-medium text-[#3B82F6] hover:underline"
        >
          ← {club.name}
        </Link>
      </nav>
      <div className="px-4 pb-10 lg:px-6">
        <EventCheckInManager event={event} club={club} />
      </div>
    </PageShell>
  );
}
