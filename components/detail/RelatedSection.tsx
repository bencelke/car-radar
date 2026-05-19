import { cn } from "@/lib/utils";

type RelatedSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function RelatedSection({
  title,
  children,
  className,
}: RelatedSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 p-5 backdrop-blur-xl",
        className
      )}
    >
      <h2 className="font-heading mb-4 text-lg font-semibold text-[#F8FAFC]">
        {title}
      </h2>
      {children}
    </section>
  );
}
