"use client";

import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";

export function useAdminGuard() {
  const auth = useAuth();
  const { t } = useLocale();

  const blocked =
    !auth.isDevAdminBypass &&
    !auth.loading &&
    !auth.adminLoading &&
    !auth.isAdmin;

  function AdminGuardFallback() {
    if (auth.loading || auth.adminLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-[#64748B]" />
        </div>
      );
    }
    if (blocked) {
      return (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {t.auth.adminAccessRequired}
        </p>
      );
    }
    return null;
  }

  return {
    ...auth,
    canUseAdminTools: auth.isAdmin,
    blocked,
    AdminGuardFallback,
  };
}
