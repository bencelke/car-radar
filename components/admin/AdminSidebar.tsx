"use client";

import { cn } from "@/lib/utils";

export type AdminSection =
  | "overview"
  | "clubs"
  | "members"
  | "events"
  | "shops"
  | "imports"
  | "submissions"
  | "claims"
  | "moderation"
  | "diagnostics";

type AdminSidebarItem = {
  id: AdminSection;
  label: string;
  badge?: number;
};

type AdminSidebarProps = {
  items: AdminSidebarItem[];
  active: AdminSection;
  onSelect: (section: AdminSection) => void;
  className?: string;
};

export function AdminSidebar({
  items,
  active,
  onSelect,
  className,
}: AdminSidebarProps) {
  return (
    <nav
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-white/[0.06] bg-[#0B1118]/80 p-2",
        className
      )}
      aria-label="Admin sections"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.id)}
          className={cn(
            "flex min-h-10 items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition",
            active === item.id
              ? "bg-gradient-to-r from-[#3B82F6]/20 to-[#A855F7]/10 text-[#F8FAFC]"
              : "text-[#64748B] hover:bg-white/[0.04] hover:text-[#CBD5E1]"
          )}
        >
          <span>{item.label}</span>
          {item.badge != null && item.badge > 0 ? (
            <span className="rounded-full bg-[#F97316]/20 px-1.5 text-[10px] text-[#F97316]">
              {item.badge}
            </span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}

export function parseAdminSection(value: string | null): AdminSection {
  const allowed: AdminSection[] = [
    "overview",
    "clubs",
    "members",
    "events",
    "shops",
    "imports",
    "submissions",
    "claims",
    "moderation",
    "diagnostics",
  ];
  if (value && allowed.includes(value as AdminSection)) {
    return value as AdminSection;
  }
  return "overview";
}
