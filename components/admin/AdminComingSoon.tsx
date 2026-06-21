"use client";

import { cn } from "@/lib/utils";

type AdminComingSoonProps = {
  title?: string;
  description: string;
  className?: string;
};

export function AdminComingSoon({
  title,
  description,
  className,
}: AdminComingSoonProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-white/[0.1] bg-[#151B24]/50 p-6",
        className
      )}
    >
      {title ? (
        <p className="text-sm font-medium text-[#CBD5E1]">{title}</p>
      ) : null}
      <p className={cn("text-sm text-[#94A3B8]", title && "mt-2")}>
        {description}
      </p>
    </div>
  );
}
