import type { Metadata } from "next";

import { EventsPanel } from "@/components/dashboard/EventsPanel";
import { SectionPage } from "@/components/shared/section-page";
import { brand } from "@/lib/config/brand";
import { eventToEventItem } from "@/lib/mappers/ui";
import { getUpcomingEvents } from "@/lib/repositories/events";

export const metadata: Metadata = {
  title: "Events",
  description: `Find car meets and events on ${brand.appName}.`,
};

export default async function EventsPage() {
  const events = (await getUpcomingEvents()).map(eventToEventItem);

  return (
    <SectionPage
      title="Meets & Events"
      description="Browse upcoming meets, cruise nights, and car shows."
      badge="Events"
    >
      <EventsPanel events={events} />
    </SectionPage>
  );
}
