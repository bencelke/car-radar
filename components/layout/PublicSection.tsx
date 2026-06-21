import { cn } from "@/lib/utils";

type PublicSectionProps = {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
};

export function PublicSection({
  children,
  className,
  title,
  description,
}: PublicSectionProps) {
  return (
    <section className={cn("space-y-4 sm:space-y-6", className)}>
      {(title || description) && (
        <div>
          {title ? (
            <h2 className="font-heading text-lg font-semibold text-[#F8FAFC] sm:text-xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-[#64748B]">{description}</p>
          ) : null}
        </div>
      )}
      {children}
    </section>
  );
}
