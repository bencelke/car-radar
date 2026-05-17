import { accentStyles } from "@/lib/config/accents";
import type { DashboardStat } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatCardProps = {
  stat: DashboardStat;
  className?: string;
};

export function StatCard({ stat, className }: StatCardProps) {
  const accent = accentStyles[stat.accent];

  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#111827]/90 px-3 py-2.5 backdrop-blur-md",
        accent.border,
        accent.glow,
        className
      )}
    >
      <p className={cn("font-heading text-lg font-bold leading-none", accent.text)}>
        {stat.value}
      </p>
      <p className="mt-1 text-[10px] leading-tight text-[#64748B]">{stat.label}</p>
    </div>
  );
}
