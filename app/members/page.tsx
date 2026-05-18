import type { Metadata } from "next";

import { MemberCard } from "@/components/cards/MemberCard";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { getApprovedClubMembers } from "@/lib/repositories/club-members";
import { getApprovedClubs } from "@/lib/repositories/clubs";

export const metadata: Metadata = {
  title: "Members",
  description: `Browse club member builds on ${brand.appName}.`,
};

export default async function MembersPage() {
  const [members, clubs] = await Promise.all([
    getApprovedClubMembers(),
    getApprovedClubs(),
  ]);
  const clubMap = new Map(clubs.map((c) => [c.id, c]));

  return (
    <PageShell
      title="Member builds"
      description="Featured builds from clubs across Germany."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            club={clubMap.get(member.clubId) ?? null}
          />
        ))}
      </div>
    </PageShell>
  );
}
