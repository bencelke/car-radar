import type { Metadata } from "next";

import { EventCard } from "@/components/cards/EventCard";
import { SectionPage } from "@/components/shared/section-page";
import { brand } from "@/lib/config/brand";
import { getUpcomingEvents } from "@/lib/repositories/events";

export const metadata: Metadata = {
  title: "Events",
  description: `Find car meets and events on ${brand.appName}.`,
};

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <SectionPage
      title="Meets & Events"
      description="Browse upcoming meets, cruise nights, and car shows."
      badge="Events"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </SectionPage>
  );
}
