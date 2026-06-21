"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type HomeEmptyPanelProps = {
  message: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function HomeEmptyPanel({
  message,
  actionLabel,
  actionHref,
  className,
}: HomeEmptyPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-white/[0.1] bg-[#0B1118]/50 px-4 py-6 text-center sm:px-6 sm:py-8",
        className
      )}
    >
      <p className="mx-auto max-w-md text-sm leading-relaxed text-[#94A3B8]">
        {message}
      </p>
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-white/[0.1] bg-[#151B24]/80 px-5 text-sm font-medium text-[#93C5FD] transition hover:border-[#3B82F6]/30"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
