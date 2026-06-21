"use client";

import { Loader2 } from "lucide-react";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/lib/utils";

type AdminDataStateProps = {
  loading: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: React.ReactNode;
  className?: string;
};

export function AdminDataState({
  loading,
  error,
  empty,
  emptyTitle,
  emptyDescription,
  children,
  className,
}: AdminDataStateProps) {
  const { t } = useLocale();

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 py-12 text-sm text-[#64748B]",
          className
        )}
      >
        <Loader2 className="size-5 animate-spin" />
        {t.admin.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200",
          className
        )}
      >
        {error}
      </div>
    );
  }

  if (empty) {
    return (
      <AdminEmptyState
        title={emptyTitle ?? t.admin.noItemsFound}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return <>{children}</>;
}
