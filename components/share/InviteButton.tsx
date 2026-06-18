"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { CreateInviteDialog } from "@/components/invites/CreateInviteDialog";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { UserInviteType } from "@/lib/types";

type InviteButtonProps = {
  inviteType: UserInviteType;
  clubId?: string;
  eventId?: string;
  memberId?: string;
  targetInstagramHandle?: string;
  label?: string;
  className?: string;
};

export function InviteButton({
  inviteType,
  clubId,
  eventId,
  memberId,
  targetInstagramHandle,
  label,
  className,
}: InviteButtonProps) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const preset =
    inviteType === "join_club" && clubId
      ? { clubId }
      : inviteType === "event_invite" && eventId
        ? { eventId }
        : inviteType === "claim_profile" && memberId
          ? { memberId, instagramHandle: targetInstagramHandle }
          : "join_shiftit";

  const text =
    label ??
    (inviteType === "join_club"
      ? t.share.inviteMembers
      : inviteType === "event_invite"
        ? t.share.inviteToEvent
        : inviteType === "claim_profile"
          ? t.share.inviteOwnerToClaim
          : t.share.inviteToShiftIt);

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={className}
        onClick={() => setOpen(true)}
      >
        <UserPlus className="size-4" />
        {text}
      </Button>
      <CreateInviteDialog open={open} onClose={() => setOpen(false)} preset={preset} />
    </>
  );
}
