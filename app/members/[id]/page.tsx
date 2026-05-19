import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MemberDetailView } from "@/components/detail/MemberDetailView";
import { PageShell } from "@/components/layout/PageShell";
import { brand } from "@/lib/config/brand";
import { getClubMemberById } from "@/lib/repositories/club-members";
import { getClubById } from "@/lib/repositories/clubs";

type PageProps = {
  params: Promise<{ id: string }>;
};

function carTitle(member: {
  carMake?: string;
  carModel?: string;
  displayName: string;
}): string {
  const car = [member.carMake, member.carModel].filter(Boolean).join(" ");
  return car ? `${member.displayName}'s ${car}` : member.displayName;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await getClubMemberById(id);
  if (!member) return { title: "Member not found" };
  return {
    title: `${carTitle(member)} | ${brand.appName}`,
    description: member.buildSummary ?? `Member build on ${brand.appName}.`,
  };
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;
  const member = await getClubMemberById(id);
  if (!member) notFound();

  const club = await getClubById(member.clubId);

  return (
    <PageShell>
      <Link
        href="/members"
        className="mb-4 inline-block text-xs text-[#3B82F6] hover:underline"
      >
        ← Members
      </Link>
      <MemberDetailView member={member} club={club} />
    </PageShell>
  );
}
