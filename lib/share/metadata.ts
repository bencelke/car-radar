import type { Metadata } from "next";

import { brand } from "@/lib/config/brand";
import { normalizeAbsoluteUrl } from "@/lib/share/share-url";

export function buildShareMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = normalizeAbsoluteUrl(input.path);
  const ogImage = normalizeAbsoluteUrl(`${input.path}/opengraph-image`);

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: brand.metadata.siteName,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
  };
}
