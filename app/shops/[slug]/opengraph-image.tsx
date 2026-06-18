import { notFound } from "next/navigation";

import { categoryToLabel } from "@/lib/mappers/ui";
import { getShopBySlug } from "@/lib/repositories/shops";
import { shiftitOgImage } from "@/lib/share/og-image-template";

export { size, contentType } from "@/lib/share/og-image-template";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();

  return shiftitOgImage({
    title: shop.name,
    subtitle: categoryToLabel(shop.category),
    footer: shop.city,
  });
}
