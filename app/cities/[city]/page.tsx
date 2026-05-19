import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CityDetailView } from "@/components/detail/CityDetailView";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import {
  cityPageHasContent,
  loadCityPageData,
} from "@/lib/data/city-page";

type PageProps = {
  params: Promise<{ city: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  const data = await loadCityPageData(city);
  return {
    title: `Car clubs, meets, and shops in ${data.cityName} | ${brand.appName}`,
    description: `Discover car clubs, meets, tuning shops, and member builds in ${data.cityName} on ${brand.appName}.`,
  };
}

export default async function CityPage({ params }: PageProps) {
  const { city } = await params;
  const data = await loadCityPageData(city);
  if (!cityPageHasContent(data)) notFound();

  return (
    <PageShell>
      <CityDetailView data={data} />
    </PageShell>
  );
}
