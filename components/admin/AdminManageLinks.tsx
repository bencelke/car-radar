"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { canAccessAdmin } from "@/lib/auth/permissions";
import { ADMIN_ROUTES } from "@/lib/config/admin-routes";
import { cn } from "@/lib/utils";

type AdminManageClubLinkProps = {
  clubId: string;
  className?: string;
};

/** Admin-only deep link — no inline edit controls on public club pages. */
export function AdminManageClubLink({
  clubId,
  className,
}: AdminManageClubLinkProps) {
  const { t } = useLocale();
  const { profile } = useAuth();

  if (!canAccessAdmin(profile)) return null;

  return (
    <Link
      href={`${ADMIN_ROUTES.clubs}?clubId=${encodeURIComponent(clubId)}`}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-[#3B82F6]/25 bg-[#3B82F6]/10 px-3 text-xs font-semibold text-[#93C5FD] transition hover:border-[#3B82F6]/40 hover:text-[#F8FAFC]",
        className
      )}
    >
      <Settings2 className="size-3.5 shrink-0" aria-hidden />
      {t.admin.manageInFounderConsole}
    </Link>
  );
}

type AdminManageMemberLinkProps = {
  memberId: string;
  className?: string;
};

export function AdminManageMemberLink({
  memberId,
  className,
}: AdminManageMemberLinkProps) {
  const { t } = useLocale();
  const { profile } = useAuth();

  if (!canAccessAdmin(profile)) return null;

  return (
    <Link
      href={`${ADMIN_ROUTES.members}?memberId=${encodeURIComponent(memberId)}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-[#A855F7]/25 bg-[#A855F7]/10 px-3 py-2 text-xs font-semibold text-[#C4B5FD] transition hover:border-[#A855F7]/40 hover:text-[#F8FAFC]",
        className
      )}
    >
      <Settings2 className="size-3.5 shrink-0" aria-hidden />
      {t.admin.manageInFounderConsole}
    </Link>
  );
}
