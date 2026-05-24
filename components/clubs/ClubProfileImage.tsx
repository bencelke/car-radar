"use client";

import { useEffect, useState } from "react";

import { clubCoverUrl } from "@/lib/clubs/club-image-path";
import type { Club } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClubProfileImageProps = {
  club: Club;
  /** Cache-busted or override URL for immediate hero refresh */
  coverSrc?: string;
  className?: string;
};

/** Compact club photo — full-width on mobile, fixed card on desktop */
export function ClubProfileImage({ club, coverSrc, className }: ClubProfileImageProps) {
  const resolvedSrc = coverSrc?.trim() || clubCoverUrl(club);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const initials = club.name.slice(0, 2).toUpperCase();
  const showImage = Boolean(resolvedSrc && !imageFailed);

  useEffect(() => {
    setImageFailed(false);
    setImageLoaded(false);
  }, [resolvedSrc]);

  return (
    <div
      className={cn(
        "relative w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#151B24] shadow-[0_0_24px_-8px_rgba(239,68,68,0.45)]",
        "aspect-[16/10] max-h-[180px] sm:aspect-[5/4] sm:h-[160px] sm:max-h-[160px] sm:w-[200px] sm:max-w-[200px]",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#111827] font-heading text-3xl font-bold text-white/20 sm:text-4xl",
          showImage && imageLoaded && "opacity-0"
        )}
        aria-hidden={showImage && imageLoaded}
      >
        {initials}
      </div>
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={resolvedSrc}
          src={resolvedSrc}
          alt=""
          decoding="async"
          className={cn(
            "relative z-10 size-full object-cover transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageFailed(true)}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 z-20 rounded-2xl ring-1 ring-inset ring-white/10" />
    </div>
  );
}
