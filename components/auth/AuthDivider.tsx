"use client";

import { cn } from "@/lib/utils";

type AuthDividerProps = {
  label: string;
  className?: string;
};

export function AuthDivider({ label, className }: AuthDividerProps) {
  return (
    <div
      className={cn("my-5 flex items-center gap-4 sm:my-6", className)}
      role="separator"
    >
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="max-w-[12rem] text-center text-xs font-medium uppercase tracking-[0.06em] text-[#64748B] sm:max-w-none">
        {label}
      </span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}
