"use client";

import { useState } from "react";

import type { ClubMember } from "@/lib/types";
import { memberImageAlt } from "@/lib/members/member-image-alt";
import { memberAvatarGradient } from "@/lib/members/roles";
import { memberAvatarInitial } from "@/lib/utils/instagram";
import { cn } from "@/lib/utils";

type MemberCarPhotoProps = {
  member: ClubMember;
  className?: string;
  variant?: "default" | "card" | "hero" | "compact";
};

export function MemberCarPhoto({
  member,
  className,
  variant = "default",
}: MemberCarPhotoProps) {
  const src = member.imageUrl ?? member.avatarUrl;
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const gradient = memberAvatarGradient(member);
  const initial = memberAvatarInitial(member);
  const alt = memberImageAlt(member);
  const showImage = Boolean(src && !imageFailed);

  const isHero = variant === "hero";
  const isCard = variant === "card";
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#151B24]",
        !isCard && "min-h-[7rem]",
        isHero && "min-h-[12rem] sm:min-h-[16rem]",
        isCard && "h-full min-h-0",
        isCompact && "min-h-[5rem]",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br font-heading font-bold text-white/80",
          gradient,
          isHero ? "text-3xl sm:text-4xl" : isCard ? "text-2xl" : "text-2xl",
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
            "relative z-10 h-full w-full object-cover transition-opacity duration-200",
            isHero && "max-h-[420px]",
            isCompact && "max-h-[140px]",
            !isCard && !isCompact && "max-h-[280px]",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-[#0B1118] via-[#0B1118]/40 to-transparent",
          isCard && "from-[#0B1118] via-[#0B1118]/60",
          isHero && "from-[#0B1118] via-[#0B1118]/50"
        )}
      />
    </div>
  );
}
