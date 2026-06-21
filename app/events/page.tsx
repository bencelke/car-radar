import type { Metadata } from "next";

import { MeetFinderClient } from "@/components/events/MeetFinderClient";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { getPublicEvents } from "@/lib/repositories/events";

export const metadata: Metadata = {
  title: `Meet Finder · ${brand.metadata.siteName}`,
  description: `Find car meets and events on ${brand.appName}.`,
};

export default async function EventsPage() {
  const events = await getPublicEvents();

  return (
    <PageShell maxWidth="default">
      <MeetFinderClient events={events} />
    </PageShell>
  );
}
