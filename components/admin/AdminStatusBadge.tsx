"use client";

import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  published: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  active: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  claimed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  unclaimed: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  rejected: "border-red-500/30 bg-red-500/10 text-red-200",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-200",
  archived: "border-slate-500/30 bg-slate-500/10 text-slate-400",
  draft: "border-blue-500/30 bg-blue-500/10 text-blue-200",
  featured: "border-purple-500/30 bg-purple-500/10 text-purple-200",
  founder: "border-purple-500/30 bg-purple-500/10 text-purple-200",
  admin: "border-red-500/30 bg-red-500/10 text-red-200",
};

type AdminStatusBadgeProps = {
  status: string;
  className?: string;
};

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  const key = status.toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        STATUS_STYLES[key] ?? "border-white/10 bg-white/5 text-[#CBD5E1]",
        className
      )}
    >
      {status}
    </span>
  );
}
