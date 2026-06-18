import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicGarageView } from "@/components/garage/PublicGarageView";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { isPublicGarage } from "@/lib/garage/garage-auth";
import { getPrimaryCarByGarageId } from "@/lib/repositories/garage-cars";
import { getGarageMods } from "@/lib/repositories/garage-mods";
import { getBuildUpdates } from "@/lib/repositories/garage-updates";
import { getGarageById } from "@/lib/repositories/garages";
import { buildShareMetadata } from "@/lib/share/metadata";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const garage = await getGarageById(id);
  if (!garage || !isPublicGarage(garage)) return { title: "Garage not found" };
  const car = await getPrimaryCarByGarageId(garage.id);
  const carLine = car ? [car.year, car.make, car.model].filter(Boolean).join(" ") : "";
  return buildShareMetadata({
    title: `${garage.displayName} | ${brand.appName}`,
    description: carLine || `${garage.displayName} on ${brand.domainName}`,
    path: `/garage/${id}`,
  });
}

export default async function PublicGaragePage({ params }: PageProps) {
  const { id } = await params;
  const garage = await getGarageById(id);
  if (!garage || !isPublicGarage(garage)) notFound();

  const car = await getPrimaryCarByGarageId(garage.id);
  if (!car || car.status !== "published") notFound();

  const [mods, updates] = await Promise.all([
    getGarageMods(car.id),
    getBuildUpdates(car.id),
  ]);

  const installedMods = mods.filter((m) => m.status === "installed");

  return (
    <PageShell>
      <PublicGarageView
        garage={garage}
        car={car}
        mods={installedMods}
        updates={updates}
      />
    </PageShell>
  );
}
