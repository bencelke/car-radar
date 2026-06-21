"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminActionCardProps = {
  title: string;
  description?: string;
  href?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  badge?: string;
  onClick?: () => void;
  className?: string;
};

export function AdminActionCard({
  title,
  description,
  href,
  icon: Icon,
  disabled = false,
  badge,
  onClick,
  className,
}: AdminActionCardProps) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon ? (
            <span className="flex size-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0B1118]/80">
              <Icon className="size-4 text-[#93C5FD]" />
            </span>
          ) : null}
          <p className="text-sm font-semibold text-[#F8FAFC]">{title}</p>
        </div>
        {badge ? (
          <span className="rounded-full bg-[#64748B]/20 px-2 py-0.5 text-[10px] font-medium text-[#94A3B8]">
            {badge}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className="mt-2 text-xs leading-relaxed text-[#64748B]">
          {description}
        </p>
      ) : null}
    </>
  );

  const shellClass = cn(
    "block rounded-xl border border-white/[0.08] bg-[#151B24]/60 p-4 text-left transition",
    disabled
      ? "cursor-not-allowed opacity-60"
      : "hover:border-[#3B82F6]/30 hover:bg-[#151B24]",
    className
  );

  if (disabled || (!href && !onClick)) {
    return <div className={shellClass}>{inner}</div>;
  }

  if (href) {
    return (
      <Link href={href} className={shellClass}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={shellClass} onClick={onClick}>
      {inner}
    </button>
  );
}
