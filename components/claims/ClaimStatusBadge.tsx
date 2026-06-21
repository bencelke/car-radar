"use client";

import type { ClaimableRecord } from "@/lib/claims/claim-utils";
import {
  getEffectiveClaimStatus,
  isCommunityListed,
  isRecordClaimed,
} from "@/lib/claims/claim-utils";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type ClaimStatusBadgeProps = {
  record: ClaimableRecord;
  className?: string;
};

export function ClaimStatusBadge({ record, className }: ClaimStatusBadgeProps) {
  const { t } = useLocale();
  const claimStatus = getEffectiveClaimStatus(record);
  const verified = "verified" in record && Boolean(record.verified);
  const verifiedByClub =
    "verifiedByClub" in record && Boolean(record.verifiedByClub);

  if (verified || verifiedByClub) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-[#22C55E]/40 bg-[#22C55E]/12 px-2 py-0.5 text-[10px] font-semibold text-[#86EFAC]",
          className
        )}
      >
        {t.claims.badgeVerified}
      </span>
    );
  }

  if (isRecordClaimed(record) || claimStatus === "claimed") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-[#3B82F6]/35 bg-[#3B82F6]/12 px-2 py-0.5 text-[10px] font-semibold text-[#93C5FD]",
          className
        )}
      >
        {t.claims.badgeClaimed}
      </span>
    );
  }

  if (isCommunityListed(record)) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full border border-[#F97316]/35 bg-[#F97316]/12 px-2 py-0.5 text-[10px] font-semibold text-[#FDBA74]",
          className
        )}
      >
        {t.claims.badgeCommunityListed}
      </span>
    );
  }

  return null;
}
