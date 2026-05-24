"use client";

import { useState } from "react";

import type { ClubMember } from "@/lib/types";
import { memberImageAlt } from "@/lib/members/member-image-alt";
import { memberAvatarGradient } from "@/lib/members/roles";
import { memberAvatarInitial } from "@/lib/utils/instagram";
import { cn } from "@/lib/utils";

type MemberProfileCarImageProps = {
  member: ClubMember;
  className?: string;
};

/** Compact car photo — full-width on mobile, fixed thumbnail on desktop */
export function MemberProfileCarImage({ member, className }: MemberProfileCarImageProps) {
  const src = member.imageUrl ?? member.avatarUrl;
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const initial = memberAvatarInitial(member);
  const gradient = memberAvatarGradient(member);
  const alt = memberImageAlt(member);
  const showImage = Boolean(src && !imageFailed);

  return (
    <div
      className={cn(
        "relative w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#151B24] shadow-[0_0_20px_-8px_rgba(59,130,246,0.4)]",
        "aspect-[16/9] max-h-[180px] sm:aspect-[4/3] sm:max-h-[150px] sm:w-[220px] sm:max-w-[220px]",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br font-heading text-2xl font-bold text-white/85 sm:text-3xl",
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
            "relative z-10 size-full object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl ring-1 ring-inset ring-white/5" />
    </div>
  );
}
