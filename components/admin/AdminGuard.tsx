"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { brand } from "@/lib/config/brand";
import { getSafeNextRoute } from "@/lib/auth/sanitize-next-path";
import { canAccessAdmin } from "@/lib/auth/permissions";

type AdminGuardProps = {
  children: React.ReactNode;
  loginNextPath?: string;
};

/**
 * Protects admin routes: loading state, login redirect, or access denied.
 * Prefer Firestore profile fields via {@link isAdminUser} — no UID checks here.
 */
export function AdminGuard({
  children,
  loginNextPath = brand.nav.admin.href,
}: AdminGuardProps) {
  const router = useRouter();
  const { user, profile, loading, adminLoading, isDevAdminBypass, refreshProfile } =
    useAuth();

  const allowed = isDevAdminBypass || canAccessAdmin(profile);

  useEffect(() => {
    if (loading || adminLoading) return;
    if (!user) {
      const next = encodeURIComponent(getSafeNextRoute(loginNextPath));
      router.replace(`${brand.nav.login.href}?next=${next}`);
    }
  }, [loading, adminLoading, user, router, loginNextPath]);

  if (loading || (user && adminLoading && !isDevAdminBypass)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#64748B]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#64748B]" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <AdminAccessDenied onRefresh={() => void refreshProfile()} />
    );
  }

  return <>{children}</>;
}
