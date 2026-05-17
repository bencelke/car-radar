import { cn } from "@/lib/utils";

type GlassPanelProps = {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
};

export function GlassPanel({
  children,
  className,
  elevated = false,
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-[#0B1118]/80 backdrop-blur-xl",
        elevated && "bg-[#111827]/90 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 px-4 py-3", className)}>
      <h3 className="font-heading text-sm font-semibold tracking-wide text-[#F8FAFC]">
        {title}
      </h3>
      {action}
    </div>
  );
}
