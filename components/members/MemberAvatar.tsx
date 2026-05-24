"use client";

import { useState } from "react";

import type { ClubMember } from "@/lib/types";
import { memberImageAlt } from "@/lib/members/member-image-alt";
import { memberAvatarGradient } from "@/lib/members/roles";
import { memberAvatarInitial } from "@/lib/utils/instagram";
import { cn } from "@/lib/utils";

type MemberAvatarProps = {
  member: ClubMember;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-10 text-sm",
  md: "size-14 text-base",
  lg: "size-24 text-2xl sm:size-28",
};

export function MemberAvatar({
  member,
  size = "md",
  className,
}: MemberAvatarProps) {
  const src = member.avatarUrl ?? member.imageUrl;
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const initial = memberAvatarInitial(member);
  const gradient = memberAvatarGradient(member);
  const alt = memberImageAlt(member);
  const showImage = Boolean(src && !imageFailed);
  const boxClass = cn(
    "relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#151B24]",
    sizeClasses[size],
    className
  );

  return (
    <div className={boxClass}>
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br font-heading font-bold text-white/90",
          gradient,
          showImage && imageLoaded && "opacity-0"
        )}
        aria-hidden={showImage && imageLoaded}
      >
        {initial}
      </div>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          decoding="async"
          className={cn(
            "relative z-10 size-full object-cover transition-opacity duration-200",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      ) : null}
    </div>
  );
}
