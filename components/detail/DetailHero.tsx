import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type DetailHeroProps = {
  title: string;
  subtitle?: string;
  typeBadge?: string;
  verified?: boolean;
  verifiedLabel?: string;
  location?: string;
  gradientClassName?: string;
  children?: React.ReactNode;
};

export function DetailHero({
  title,
  subtitle,
  typeBadge,
  verified,
  verifiedLabel = "Verified",
  location,
  gradientClassName = "from-[#EF4444]/30 via-[#111827] to-[#3B82F6]/25",
  children,
}: DetailHeroProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/90 backdrop-blur-xl">
      <div
        className={cn(
          "relative h-36 bg-gradient-to-br sm:h-44",
          gradientClassName
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1118] via-[#0B1118]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {typeBadge ? (
              <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
                {typeBadge}
              </span>
            ) : null}
            {verified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#22C55E]/40 bg-[#22C55E]/15 px-2 py-0.5 text-[10px] font-semibold text-[#22C55E]">
                <BadgeCheck className="size-3" />
                {verifiedLabel}
              </span>
            ) : null}
          </div>
          <h1 className="font-heading mt-2 text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-[#94A3B8]">{subtitle}</p>
          ) : null}
          {location ? (
            <p className="mt-1 text-xs text-[#64748B]">{location}</p>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="border-t border-white/[0.06] p-5">{children}</div>
      ) : null}
    </section>
  );
}
