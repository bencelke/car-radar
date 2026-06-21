"use client";

import { UserTitleBadge } from "@/components/profile/UserTitleBadge";
import { UserAvatar } from "@/components/profile/UserAvatar";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getUserDisplayTitle, isFounderUser } from "@/lib/auth/permissions";
import { displayNameFromUserLike } from "@/lib/auth/user-display";
import { cn } from "@/lib/utils";

type AdminHeaderProps = {
  title: string;
  subtitle?: string;
  compact?: boolean;
};

export function AdminHeader({ title, subtitle, compact }: AdminHeaderProps) {
  const { t } = useLocale();
  const { user, profile } = useAuth();
  const displayName = displayNameFromUserLike(profile, user);
  const titleLabel = getUserDisplayTitle(profile);

  if (compact) {
    return (
      <div className="min-w-0">
        <p className="truncate font-heading text-sm font-bold text-[#F8FAFC]">
          {title}
        </p>
        {titleLabel ? (
          <UserTitleBadge profile={profile} className="mt-1" />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-heading text-lg font-bold text-[#F8FAFC]">{title}</h1>
        {isFounderUser(profile) ? (
          <span className="rounded-full border border-[#A855F7]/30 bg-[#A855F7]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#C4B5FD]">
            ShiftIt
          </span>
        ) : null}
      </div>
      {subtitle ? (
        <p className="mt-1 text-xs text-[#64748B]">{subtitle}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <UserAvatar profile={profile} authUser={user} size="sm" rounded="xl" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[#CBD5E1]">{displayName}</span>
          <UserTitleBadge profile={profile} />
        </div>
      </div>
    </div>
  );
}

type AdminShellHeaderProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function AdminShellHeader({
  title,
  subtitle,
  className,
}: AdminShellHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <h1 className="font-heading text-2xl font-bold text-[#F8FAFC]">{title}</h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
      ) : null}
    </div>
  );
}
