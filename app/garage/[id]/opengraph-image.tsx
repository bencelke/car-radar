import { notFound } from "next/navigation";

import { isPublicGarage } from "@/lib/garage/garage-auth";
import { getPrimaryCarByGarageId } from "@/lib/repositories/garage-cars";
import { getGarageById } from "@/lib/repositories/garages";
import { shiftitOgImage } from "@/lib/share/og-image-template";

export { size, contentType } from "@/lib/share/og-image-template";

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const garage = await getGarageById(id);
  if (!garage || !isPublicGarage(garage)) notFound();
  const car = await getPrimaryCarByGarageId(garage.id);
  const subtitle = car
    ? [car.year, car.make, car.model].filter(Boolean).join(" ")
    : garage.displayName;

  return shiftitOgImage({
    title: garage.displayName,
    subtitle,
    footer: [garage.city, garage.clubName].filter(Boolean).join(" · "),
  });
}
