"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type HomeSectionHeaderProps = {
  title: string;
  subtitle?: string;
  href?: string;
  actionLabel?: string;
  className?: string;
};

export function HomeSectionHeader({
  title,
  subtitle,
  href,
  actionLabel,
  className,
}: HomeSectionHeaderProps) {
  const { t } = useLocale();

  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div>
        <h2 className="font-heading text-xl font-bold tracking-tight text-[#F8FAFC] sm:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-sm text-[#64748B]">{subtitle}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-medium text-[#93C5FD] transition hover:text-[#BFDBFE]"
        >
          {actionLabel ?? t.home.viewAll}
        </Link>
      ) : null}
    </div>
  );
}
