"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import {
  correctionLoginPath,
  correctionRequestPath,
} from "@/lib/claims/claim-utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type CorrectionRequestLinkProps = {
  targetType: "club" | "member" | "shop" | "event";
  targetId: string;
  targetName: string;
  requestType?: "correction" | "removal";
  className?: string;
};

export function CorrectionRequestLink({
  targetType,
  targetId,
  targetName,
  requestType = "correction",
  className,
}: CorrectionRequestLinkProps) {
  const { t } = useLocale();
  const { user } = useAuth();

  const href = user
    ? correctionRequestPath(targetType, targetId, targetName, requestType)
    : correctionLoginPath(targetType, targetId, targetName, requestType);

  const label =
    requestType === "removal"
      ? t.corrections.requestRemoval
      : t.corrections.requestCorrection;

  const Icon = requestType === "removal" ? Trash2 : Pencil;

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#151B24]/50 px-2.5 text-xs font-medium text-[#94A3B8] transition hover:border-white/20 hover:text-[#F8FAFC] sm:px-3",
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      {label}
    </Link>
  );
}
