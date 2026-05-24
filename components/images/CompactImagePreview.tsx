"use client";

import { ImagePlus } from "lucide-react";

import { cn } from "@/lib/utils";

type CompactImagePreviewProps = {
  src?: string;
  alt?: string;
  placeholderInitial?: string;
  placeholderGradient?: string;
  size?: "sm" | "md";
  className?: string;
};

const sizeMap = {
  sm: "size-24", // 96px
  md: "size-32", // 128px
};

export function CompactImagePreview({
  src,
  alt = "",
  placeholderInitial,
  placeholderGradient = "from-[#1E293B] to-[#0F172A]",
  size = "sm",
  className,
}: CompactImagePreviewProps) {
  const box = cn(
    "relative shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#151B24]",
    className ?? sizeMap[size]
  );

  if (!src) {
    return (
      <div
        className={cn(
          box,
          "flex items-center justify-center bg-gradient-to-br",
          placeholderGradient
        )}
      >
        {placeholderInitial ? (
          <span className="font-heading text-lg font-bold text-white/80">
            {placeholderInitial}
          </span>
        ) : (
          <ImagePlus className="size-6 text-[#64748B]" aria-hidden />
        )}
      </div>
    );
  }

  return (
    <div className={box}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        decoding="async"
        className="size-full object-cover"
      />
    </div>
  );
}
