import Link from "next/link";

type RelatedEntityListProps = {
  items: { href: string; title: string; subtitle?: string }[];
  emptyMessage?: string;
};

export function RelatedEntityList({
  items,
  emptyMessage,
}: RelatedEntityListProps) {
  if (items.length === 0) {
    return emptyMessage ? (
      <p className="text-sm text-[#64748B]">{emptyMessage}</p>
    ) : null;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="block rounded-xl border border-white/[0.06] bg-[#151B24]/40 px-3 py-2.5 transition hover:border-white/[0.1] hover:bg-[#151B24]/70"
          >
            <p className="text-sm font-medium text-[#F8FAFC]">{item.title}</p>
            {item.subtitle ? (
              <p className="mt-0.5 text-xs text-[#64748B]">{item.subtitle}</p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
