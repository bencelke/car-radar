"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import {
  canShowClaimCta,
  claimCtaLabelKey,
  claimLoginPath,
  claimPagePath,
  type ClaimableRecord,
} from "@/lib/claims/claim-utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { ProfileClaimTargetType } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClaimProfileButtonProps = {
  targetType: ProfileClaimTargetType;
  targetId: string;
  record: ClaimableRecord;
  className?: string;
  variant?: "primary" | "secondary";
};

export function ClaimProfileButton({
  targetType,
  targetId,
  record,
  className,
  variant = "primary",
}: ClaimProfileButtonProps) {
  const { t } = useLocale();
  const { user } = useAuth();

  if (!canShowClaimCta(record, user?.uid)) return null;

  const labelKey = claimCtaLabelKey(targetType);
  const href = user
    ? claimPagePath(targetType, targetId)
    : claimLoginPath(targetType, targetId);

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition",
        variant === "primary"
          ? "border-[#EF4444]/45 bg-[#EF4444]/18 text-[#F8FAFC] hover:bg-[#EF4444]/28"
          : "border-white/10 bg-[#151B24]/70 text-[#CBD5E1] hover:border-white/20 hover:text-[#F8FAFC]",
        className
      )}
    >
      <ShieldCheck className="size-3.5 shrink-0" />
      {t.claims[labelKey]}
    </Link>
  );
}
