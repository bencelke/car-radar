"use client";

import { cn } from "@/lib/utils";

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
};

type AdminTableProps<T> = {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  actions?: (row: T) => React.ReactNode;
  className?: string;
};

export function AdminTable<T>({
  columns,
  rows,
  rowKey,
  actions,
  className,
}: AdminTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-white/[0.06]", className)}>
      <table className="hidden min-w-full text-left text-sm md:table">
        <thead className="border-b border-white/[0.06] bg-[#151B24]/80">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
            {actions ? (
              <th className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                Actions
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-white/[0.04] hover:bg-white/[0.02]"
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-3 py-2.5 text-[#CBD5E1]", col.className)}>
                  {col.render(row)}
                </td>
              ))}
              {actions ? (
                <td className="px-3 py-2.5">{actions(row)}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divide-y divide-white/[0.06] md:hidden">
        {rows.map((row) => (
          <div key={rowKey(row)} className="space-y-2 p-3">
            {columns.map((col) => (
              <div key={col.key} className="flex justify-between gap-3 text-xs">
                <span className="text-[#64748B]">{col.header}</span>
                <span className="max-w-[60%] truncate text-right text-[#CBD5E1]">
                  {col.render(row)}
                </span>
              </div>
            ))}
            {actions ? <div className="pt-1">{actions(row)}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
