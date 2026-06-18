import { notFound } from "next/navigation";

import { getClubById, getClubBySlug } from "@/lib/repositories/clubs";
import { shiftitOgImage } from "@/lib/share/og-image-template";

export { size, contentType } from "@/lib/share/og-image-template";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const club = (await getClubBySlug(slug)) ?? (await getClubById(slug));
  if (!club) notFound();

  return shiftitOgImage({
    title: club.name,
    subtitle: club.type,
    footer: [club.city, club.country].filter(Boolean).join(" · "),
  });
}
