import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ShopDetailView } from "@/components/detail/ShopDetailView";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { categoryToLabel } from "@/lib/mappers/ui";
import { getApprovedClubs } from "@/lib/repositories/clubs";
import { getApprovedEvents } from "@/lib/repositories/events";
import { getShopBySlug } from "@/lib/repositories/shops";
import { buildShareMetadata } from "@/lib/share/metadata";
import { getEntitySlug } from "@/lib/utils/slug";

type PageProps = {
  params: Promise<{ slug: string }>;
};

async function resolveShop(slug: string) {
  return getShopBySlug(slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = await resolveShop(slug);
  if (!shop) return { title: "Shop not found" };
  const category = categoryToLabel(shop.category);
  return buildShareMetadata({
    title: `${shop.name} | ${shop.city} Car Shop | ${brand.appName}`,
    description: `Find ${shop.name}, a ${category} shop in ${shop.city}. View services, socials, directions, and nearby car scene info on ${brand.appName}.`,
    path: `/shops/${getEntitySlug(shop)}`,
  });
}

export default async function ShopDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const shop = await resolveShop(slug);
  if (!shop) notFound();

  const [allEvents, allClubs] = await Promise.all([
    getApprovedEvents(),
    getApprovedClubs(),
  ]);

  const relatedEvents = allEvents
    .filter((e) => e.city === shop.city)
    .slice(0, 8);
  const relatedClubs = allClubs
    .filter((c) => c.city === shop.city || c.area === shop.city)
    .slice(0, 8);

  return (
    <PageShell>
      <Link
        href="/shops"
        className="mb-4 inline-block text-xs text-[#3B82F6] hover:underline"
      >
        ← Shops
      </Link>
      <ShopDetailView
        shop={shop}
        relatedClubs={relatedClubs}
        relatedEvents={relatedEvents}
      />
    </PageShell>
  );
}
