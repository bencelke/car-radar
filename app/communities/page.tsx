import type { Metadata } from "next";

import { CommunitiesPanel } from "@/components/dashboard/CommunitiesPanel";
import { SectionPage } from "@/components/shared/section-page";
import { brand } from "@/lib/config/brand";
import { communityToCommunityItem } from "@/lib/mappers/ui";
import { getApprovedCommunities } from "@/lib/repositories/communities";

export const metadata: Metadata = {
  title: "Communities",
  description: `Find car clubs and enthusiast communities on ${brand.appName}.`,
};

export default async function CommunitiesPage() {
  const communities = (await getApprovedCommunities()).map(
    communityToCommunityItem
  );

  return (
    <SectionPage
      title="Clubs & Communities"
      description="Connect with local clubs, crews, and enthusiast groups."
      badge="Communities"
    >
      <CommunitiesPanel communities={communities} />
    </SectionPage>
  );
}
