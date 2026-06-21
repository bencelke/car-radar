import { cn } from "@/lib/utils";

type PublicPageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  compact?: boolean;
};

export function PublicPageHeader({
  title,
  subtitle,
  actions,
  className,
  compact = false,
}: PublicPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1
          className={cn(
            "font-heading font-bold tracking-tight text-[#F8FAFC]",
            compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
          )}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              "mt-2 max-w-2xl leading-relaxed text-[#64748B]",
              compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
