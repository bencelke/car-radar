import { notFound } from "next/navigation";

import { getClubMemberById } from "@/lib/repositories/club-members";
import { shiftitOgImage } from "@/lib/share/og-image-template";

export { size, contentType } from "@/lib/share/og-image-template";

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const member = await getClubMemberById(id);
  if (!member) notFound();
  const car = [member.carMake, member.carModel].filter(Boolean).join(" ");

  return shiftitOgImage({
    title: member.displayName,
    subtitle: car || member.clubName,
    footer: member.city,
  });
}
