import { Suspense } from "react";
import { notFound } from "next/navigation";

import { EventCheckInPageContent } from "@/components/events/EventCheckInPageContent";
import { getEventBySlug } from "@/lib/repositories/events";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventCheckInPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-[#64748B]">
          …
        </div>
      }
    >
      <EventCheckInPageContent event={event} />
    </Suspense>
  );
}
