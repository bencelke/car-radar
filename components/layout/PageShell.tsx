import { cn } from "@/lib/utils";

type PageShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
};

export function PageShell({
  children,
  title,
  description,
  className,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1920px] flex-1 px-4 py-6 lg:px-6",
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
            <p className="mt-2 max-w-2xl text-sm text-[#64748B]">{description}</p>
          ) : null}
        </div>
      )}
      {children}
    </div>
  );
}
