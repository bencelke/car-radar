"use client";

import { cn } from "@/lib/utils";

type AdminEmptyStateProps = {
  title: string;
  description?: string;
  className?: string;
};

export function AdminEmptyState({
  title,
  description,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-white/[0.1] bg-[#151B24]/40 px-4 py-8 text-center",
        className
      )}
    >
      <p className="text-sm font-medium text-[#CBD5E1]">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-[#64748B]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
