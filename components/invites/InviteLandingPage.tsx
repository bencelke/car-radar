"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";
import { markInviteUsed } from "@/lib/repositories/user-invites";
import { trackShareAction } from "@/lib/repositories/share-analytics";
import type { UserInvite } from "@/lib/types";

type InviteLandingPageProps = {
  invite: UserInvite;
  clubName?: string;
  eventTitle?: string;
  memberName?: string;
};

export function InviteLandingPage({
  invite,
  clubName,
  eventTitle,
  memberName,
}: InviteLandingPageProps) {
  const { t } = useLocale();
  const { user } = useAuth();
  const router = useRouter();
  const loginHref = `/login?next=${encodeURIComponent(`/invite/${invite.inviteCode}`)}`;

  useEffect(() => {
    void trackShareAction({
      action: "invite_opened",
      entityType: "invite",
      entityId: invite.inviteCode,
      userId: user?.uid,
      source: "invite_landing",
    });
  }, [invite.inviteCode, user?.uid]);

  if (invite.status === "expired") {
    return (
      <InviteShell>
        <h1 className="text-xl font-bold text-[#F8FAFC]">{t.share.inviteExpired}</h1>
        <Link href="/" className="mt-4 text-sm text-[#3B82F6] hover:underline">
          {t.share.continueToShiftIt}
        </Link>
      </InviteShell>
    );
  }

  if (invite.status === "cancelled") {
    return (
      <InviteShell>
        <h1 className="text-xl font-bold text-[#F8FAFC]">{t.share.inviteCancelled}</h1>
        <Link href="/" className="mt-4 text-sm text-[#3B82F6] hover:underline">
          {t.share.continueToShiftIt}
        </Link>
      </InviteShell>
    );
  }

  const title = (() => {
    switch (invite.inviteType) {
      case "join_club":
        return clubName ? `${t.share.inviteToClub}: ${clubName}` : t.share.joinShiftIt;
      case "event_invite":
        return eventTitle ? `${t.share.inviteToEvent}: ${eventTitle}` : t.share.joinShiftIt;
      case "claim_profile":
        return t.share.claimThisProfile;
      default:
        return t.share.joinShiftIt;
    }
  })();

  const body = (() => {
    if (invite.inviteType === "claim_profile") {
      return memberName
        ? `${t.share.profileMayBeYours} — ${memberName}`
        : t.share.profileMayBeYours;
    }
    return `${brand.appName} — ${brand.tagline}`;
  })();

  async function continueAfterAuth() {
    if (!user) {
      router.push(loginHref);
      return;
    }
    await markInviteUsed(invite.inviteCode, user.uid);
    void trackShareAction({
      action: "invite_used",
      entityType: "invite",
      entityId: invite.inviteCode,
      userId: user.uid,
      source: "invite_landing",
    });

    if (invite.inviteType === "claim_profile" && invite.memberId) {
      router.push(`/members/${invite.memberId}?claim=1`);
      return;
    }
    if (invite.inviteType === "join_club" && invite.clubId) {
      router.push(`/clubs/${invite.clubId}`);
      return;
    }
    if (invite.inviteType === "event_invite" && invite.eventId) {
      router.push(`/events/${invite.eventId}`);
      return;
    }
    router.push("/");
  }

  return (
    <InviteShell>
      <p className="text-xs uppercase tracking-wide text-[#64748B]">{brand.appName}</p>
      <h1 className="mt-2 font-heading text-2xl font-bold text-[#F8FAFC]">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#94A3B8]">{body}</p>
      <div className="mt-6 flex flex-col gap-2">
        {user ? (
          <Button
            type="button"
            className="w-full border border-[#EF4444]/30 bg-[#EF4444]/15"
            onClick={() => void continueAfterAuth()}
          >
            {invite.inviteType === "claim_profile"
              ? t.share.claimThisProfile
              : t.share.continueToShiftIt}
          </Button>
        ) : (
          <>
            <Button
              nativeButton={false}
              render={<Link href={loginHref} />}
              className="w-full border border-[#3B82F6]/30 bg-[#3B82F6]/15"
            >
              {t.auth.login}
            </Button>
            <Button
              nativeButton={false}
              render={<Link href={loginHref} />}
              variant="outline"
              className="w-full border-white/10"
            >
              {t.share.createAccountToContinue}
            </Button>
          </>
        )}
        <Link href="/" className="text-center text-xs text-[#64748B] hover:text-[#CBD5E1]">
          {t.share.continueToShiftIt}
        </Link>
      </div>
    </InviteShell>
  );
}

function InviteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 p-6">{children}</div>
    </div>
  );
}
