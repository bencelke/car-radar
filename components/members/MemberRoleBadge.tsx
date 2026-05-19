"use client";

import {
  Camera,
  Car,
  Crown,
  Navigation,
  ShieldCheck,
  User,
} from "lucide-react";

import { useLocale } from "@/components/providers/LocaleProvider";
import {
  isStaffRole,
  memberRoleLabelKey,
  normalizeMemberRole,
} from "@/lib/members/roles";
import type { MemberRole } from "@/lib/members/roles";
import { cn } from "@/lib/utils";

type MemberRoleBadgeProps = {
  role?: MemberRole | string | null;
  size?: "xs" | "sm";
  className?: string;
};

function RoleIcon({ role }: { role: MemberRole }) {
  const className = "size-3 shrink-0";
  switch (role) {
    case "club_owner":
    case "founder":
      return <Crown className={className} />;
    case "club_admin":
      return <ShieldCheck className={className} />;
    case "road_captain":
      return <Navigation className={className} />;
    case "photographer":
      return <Camera className={className} />;
    case "member":
      return <Car className={className} />;
    default:
      return <User className={className} />;
  }
}

const roleStyles: Record<MemberRole, string> = {
  member: "border-white/10 bg-white/5 text-white/60",
  club_owner: "border-amber-500/40 bg-amber-500/15 text-amber-200",
  club_admin: "border-blue-500/40 bg-blue-500/15 text-blue-200",
  founder: "border-amber-500/40 bg-amber-500/15 text-amber-200",
  road_captain: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
  photographer: "border-purple-500/40 bg-purple-500/15 text-purple-200",
};

export function MemberRoleBadge({
  role,
  size = "sm",
  className,
}: MemberRoleBadgeProps) {
  const { t } = useLocale();
  const normalized = normalizeMemberRole(role) ?? "member";
  if (!isStaffRole(normalized)) return null;

  const labelKey = memberRoleLabelKey(normalized);
  const label = t.members[labelKey];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
        roleStyles[normalized],
        className
      )}
    >
      <RoleIcon role={normalized} />
      {label}
    </span>
  );
}
