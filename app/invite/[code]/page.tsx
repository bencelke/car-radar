import { notFound } from "next/navigation";

import { InviteLandingPage } from "@/components/invites/InviteLandingPage";
import { PageShell } from "@/components/layout/PageShell";
import { getClubMemberById } from "@/lib/repositories/club-members";
import { getClubById } from "@/lib/repositories/clubs";
import { getEventById } from "@/lib/repositories/events";
import { getInviteByCode } from "@/lib/repositories/user-invites";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default async function InvitePage({ params }: PageProps) {
  const { code } = await params;
  const invite = await getInviteByCode(code);
  if (!invite) notFound();

  const [club, event, member] = await Promise.all([
    invite.clubId ? getClubById(invite.clubId) : Promise.resolve(null),
    invite.eventId ? getEventById(invite.eventId) : Promise.resolve(null),
    invite.memberId ? getClubMemberById(invite.memberId) : Promise.resolve(null),
  ]);

  return (
    <PageShell>
      <InviteLandingPage
        invite={invite}
        clubName={club?.name}
        eventTitle={event?.title}
        memberName={member?.displayName}
      />
    </PageShell>
  );
}
