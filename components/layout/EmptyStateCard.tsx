import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type EmptyStateCardProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
  className?: string;
};

export function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actions = [],
  className,
}: EmptyStateCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-[#0B1118]/40 px-6 py-10 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <Icon className="size-7 text-[#64748B]" />
      </div>
      <p className="font-heading text-base font-semibold text-[#F8FAFC]">{title}</p>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#64748B]">
          {description}
        </p>
      ) : null}
      {actions.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {actions.map((action) => (
            <Button
              key={action.href + action.label}
              nativeButton={false}
              render={<Link href={action.href} />}
              size="sm"
              className={cn(
                "min-h-11 px-4",
                action.variant === "primary"
                  ? "border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC] hover:bg-[#EF4444]/30"
                  : "border border-white/[0.1] bg-[#151B24]/80 text-[#CBD5E1] hover:bg-[#151B24]"
              )}
            >
              {action.label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
