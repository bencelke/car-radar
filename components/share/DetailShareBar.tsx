"use client";

import { ShareButton } from "@/components/share/ShareButton";
import { InviteButton } from "@/components/share/InviteButton";
import type { ShareEntityInput } from "@/lib/share/share-types";
import type { ShareMenuInviteOptions } from "@/components/share/ShareMenu";

type DetailShareBarProps = {
  entity: ShareEntityInput;
  inviteOptions?: ShareMenuInviteOptions;
  showClaimInvite?: boolean;
};

export function DetailShareBar({
  entity,
  inviteOptions,
  showClaimInvite,
}: DetailShareBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <ShareButton entity={entity} inviteOptions={inviteOptions} compact />
      {showClaimInvite && entity.type === "member" ? (
        <InviteButton
          inviteType="claim_profile"
          memberId={entity.member.id}
          targetInstagramHandle={entity.member.instagramHandle}
        />
      ) : null}
    </div>
  );
}
