"use client";

import { useEffect, useState } from "react";

import { clubCoverUrl } from "@/lib/clubs/club-image-path";
import type { Club } from "@/lib/types";
import { cn } from "@/lib/utils";

type ClubCoverImageProps = {
  club: Club;
  className?: string;
  variant?: "compact" | "cinematic";
};

/** Banner strip for list cards — prefer ClubProfileImage on detail hero */
export function ClubCoverImage({
  club,
  className,
  variant = "compact",
}: ClubCoverImageProps) {
  const src = clubCoverUrl(club);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showImage = Boolean(src && !failed);
  const cinematic = variant === "cinematic";

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [src]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-gradient-to-br from-[#EF4444]/30 via-[#1E1B4B] to-[#7C3AED]/25",
        cinematic
          ? "min-h-[260px] h-[72vw] max-h-[320px] sm:min-h-[320px] sm:h-[42vw] sm:max-h-[400px] md:max-h-[440px]"
          : "h-28 sm:h-32",
        className
      )}
    >
      {!showImage || !loaded ? (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#111827]"
          aria-hidden={showImage && loaded}
        >
          <span
            className={cn(
              "font-heading font-bold text-white/15",
              cinematic ? "text-6xl sm:text-7xl" : "text-4xl"
            )}
          >
            {club.name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      ) : null}
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          decoding="async"
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : null}
      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          cinematic
            ? "bg-gradient-to-t from-[#0B1118] via-[#0B1118]/75 to-[#0B1118]/15"
            : "bg-gradient-to-t from-[#0B1118] via-[#0B1118]/40 to-transparent"
        )}
      />
      {cinematic ? (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B1118]/80 via-transparent to-[#0B1118]/40"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
