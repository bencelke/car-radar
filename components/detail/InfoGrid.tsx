import { cn } from "@/lib/utils";

export type InfoGridItem = {
  label: string;
  value: React.ReactNode;
};

type InfoGridProps = {
  items: InfoGridItem[];
  className?: string;
};

export function InfoGrid({ items, className }: InfoGridProps) {
  const visible = items.filter(
    (item) => item.value != null && item.value !== "" && item.value !== false
  );
  if (visible.length === 0) return null;

  return (
    <dl
      className={cn(
        "grid gap-3 rounded-xl border border-white/[0.06] bg-[#151B24]/40 p-4 sm:grid-cols-2",
        className
      )}
    >
      {visible.map((item) => (
        <div key={item.label}>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {item.label}
          </dt>
          <dd className="mt-1 text-sm text-[#E2E8F0]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
