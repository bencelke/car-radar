import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type GarageProfileCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  accent?: "default" | "red" | "blue";
  compact?: boolean;
};

const accentBorder = {
  default: "border-white/[0.08]",
  red: "border-[#EF4444]/15",
  blue: "border-[#3B82F6]/15",
};

export function GarageProfileCard({
  title,
  children,
  className,
  accent = "default",
  compact = false,
}: GarageProfileCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-[#0B1118]/90 backdrop-blur-xl",
        compact ? "p-2.5 sm:p-3" : "p-5",
        accentBorder[accent],
        className
      )}
    >
      <h2
        className={cn(
          "font-heading font-semibold uppercase tracking-[0.14em] text-[#64748B]",
          compact ? "mb-2 text-[9px]" : "mb-3 text-[10px]"
        )}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
