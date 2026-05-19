"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers/LocaleProvider";
import { correctionSubmitPath } from "@/lib/utils/entity-paths";

type CorrectionLinkProps = {
  targetType: "shop" | "event" | "club" | "member" | "zone";
  targetName: string;
  entityId?: string;
};

export function CorrectionLink({
  targetType,
  targetName,
  entityId,
}: CorrectionLinkProps) {
  const { t } = useLocale();
  const href = correctionSubmitPath(targetType, targetName, entityId);

  return (
    <Link
      href={href}
      className="text-xs text-[#64748B] underline-offset-2 hover:text-[#94A3B8] hover:underline"
    >
      {t.detail.submitCorrection}
    </Link>
  );
}
