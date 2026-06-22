import { cn } from "@/lib/utils";

type PageShellMaxWidth = "wide" | "default" | "detail";

type PageShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  /** @default wide */
  maxWidth?: PageShellMaxWidth;
};

const maxWidthClasses: Record<PageShellMaxWidth, string> = {
  wide: "max-w-[1920px]",
  default: "max-w-[1440px]",
  detail: "max-w-[1180px]",
};

export function PageShell({
  children,
  title,
  description,
  className,
  maxWidth = "wide",
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8",
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {(title || description) && (
        <div className="mb-6">
          {title ? (
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#F8FAFC] sm:text-3xl">
              {title}
            </h1>
          ) : null}
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#64748B]">
              {description}
            </p>
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
}

export const PublicPageShell = PageShell;
