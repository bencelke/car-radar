import { notFound } from "next/navigation";

import { getEventBySlug } from "@/lib/repositories/events";
import { shiftitOgImage } from "@/lib/share/og-image-template";

export { size, contentType } from "@/lib/share/og-image-template";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  return shiftitOgImage({
    title: event.title,
    subtitle: event.type,
    footer: [event.city, event.startTime?.slice(0, 10)].filter(Boolean).join(" · "),
  });
}
