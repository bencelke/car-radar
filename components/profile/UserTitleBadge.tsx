"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { getUserDisplayTitle, isFounderUser } from "@/lib/auth/permissions";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type UserTitleBadgeProps = {
  profile: UserProfile | null | undefined;
  className?: string;
};

export function UserTitleBadge({ profile, className }: UserTitleBadgeProps) {
  const { t } = useLocale();
  const title = getUserDisplayTitle(profile);

  if (!title && !isFounderUser(profile)) return null;

  const label =
    title ??
    (profile?.adminRole === "founder" ? t.profile.founder : t.profile.adminRoleLabel);

  const isFounder = isFounderUser(profile);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        isFounder
          ? "border-[#A855F7]/35 bg-[#A855F7]/10 text-[#C4B5FD]"
          : "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#93C5FD]",
        className
      )}
    >
      {label}
    </span>
  );
}
