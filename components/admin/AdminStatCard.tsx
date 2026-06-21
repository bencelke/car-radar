"use client";

import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value?: string | number | null;
  hint?: string;
  accent?: "blue" | "red" | "purple" | "amber";
  className?: string;
};

const accentStyles = {
  blue: "border-[#3B82F6]/20 bg-[#3B82F6]/5 before:via-[#3B82F6]/50",
  red: "border-[#EF4444]/20 bg-[#EF4444]/5 before:via-[#EF4444]/50",
  purple: "border-[#A855F7]/20 bg-[#A855F7]/5 before:via-[#A855F7]/50",
  amber: "border-[#F97316]/20 bg-[#F97316]/5 before:via-[#F97316]/50",
} as const;

export function AdminStatCard({
  label,
  value,
  hint,
  accent = "blue",
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 backdrop-blur-sm",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:to-transparent",
        accentStyles[accent],
        className
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
        {label}
      </p>
      <p className="mt-2 font-heading text-2xl font-bold text-[#F8FAFC]">
        {value ?? "—"}
      </p>
      {hint ? (
        <p className="mt-1 text-[10px] text-[#64748B]">{hint}</p>
      ) : null}
    </div>
  );
}
