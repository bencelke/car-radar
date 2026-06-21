"use client";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type AdminToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: { value: string; label: string }[];
  className?: string;
};

export function AdminToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filterValue,
  onFilterChange,
  filterOptions,
  className,
}: AdminToolbarProps) {
  const { t } = useLocale();

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder ?? t.admin.searchPlaceholder}
        className="h-9 w-full rounded-lg border border-white/[0.08] bg-[#0B1118] px-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] sm:max-w-xs"
      />
      {filterOptions && onFilterChange ? (
        <select
          value={filterValue ?? "all"}
          onChange={(e) => onFilterChange(e.target.value)}
          className="h-9 rounded-lg border border-white/[0.08] bg-[#0B1118] px-3 text-sm text-[#F8FAFC]"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}
