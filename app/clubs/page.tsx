import type { Metadata } from "next";

import { ClubsDirectory } from "@/components/clubs/ClubsDirectory";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { getApprovedClubs } from "@/lib/repositories/clubs";

export const metadata: Metadata = {
  title: "Clubs",
  description: `Find car clubs and member builds on ${brand.appName}.`,
};

export default async function ClubsPage() {
  const clubs = await getApprovedClubs();

  return (
    <PageShell maxWidth="default">
      <ClubsDirectory clubs={clubs} />
    </PageShell>
  );
}
