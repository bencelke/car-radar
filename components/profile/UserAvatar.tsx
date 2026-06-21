"use client";

import type { User } from "firebase/auth";
import { User as UserIcon } from "lucide-react";

import {
  getAvatarUrlFromProfile,
  getInitialsFromProfile,
} from "@/lib/auth/user-avatar";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  profile: UserProfile | null | undefined;
  authUser?: User | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  rounded?: "md" | "xl" | "2xl" | "full";
};

const sizeClasses = {
  xs: "size-8 text-xs",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-[4.5rem] text-xl sm:size-28 sm:text-2xl",
  xl: "size-32 text-3xl",
};

const roundedClasses = {
  md: "rounded-md",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

export function UserAvatar({
  profile,
  authUser,
  size = "md",
  className,
  rounded = "md",
}: UserAvatarProps) {
  const avatarUrl = getAvatarUrlFromProfile(profile, authUser);
  const initials = getInitialsFromProfile(profile, authUser);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden border border-white/[0.08] bg-[#151B24]",
        sizeClasses[size],
        roundedClasses[rounded],
        className
      )}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : size === "xs" || size === "sm" ? (
        <UserIcon className="size-4 text-[#64748B]" />
      ) : (
        <span className="flex size-full items-center justify-center bg-gradient-to-br from-[#3B82F6]/30 to-[#A855F7]/25 font-heading font-bold text-[#F8FAFC]">
          {initials}
        </span>
      )}
    </span>
  );
}
