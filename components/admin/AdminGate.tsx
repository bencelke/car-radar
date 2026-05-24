"use client";

import Link from "next/link";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { FirebaseDiagnosticsPanel } from "@/components/admin/FirebaseDiagnosticsPanel";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { brand } from "@/lib/config/brand";
import type { Submission } from "@/lib/types";

type AdminGateProps = {
  initialSubmissions: Submission[];
};

export function AdminGate({ initialSubmissions }: AdminGateProps) {
  const { t } = useLocale();
  const {
    user,
    profile,
    profileError,
    loading,
    adminLoading,
    isAdmin,
    isDevAdminBypass,
    signOut,
    refreshProfile,
  } = useAuth();

  const diagnostics = <FirebaseDiagnosticsPanel />;
  const adminLoginHref = `${brand.nav.login.href}?next=${encodeURIComponent(brand.nav.admin.href)}`;

  if (loading || (user && adminLoading && !isDevAdminBypass)) {
    return (
      <>
        {diagnostics}
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#64748B]" />
        </div>
      </>
    );
  }

  if (isDevAdminBypass) {
    return (
      <div>
        {diagnostics}
        <DevModeBanner message={t.auth.devAdminDisabled} />
        <AdminDashboard initialSubmissions={initialSubmissions} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {diagnostics}
        <AdminAccessCard
          icon={<ShieldCheck className="size-10 text-[#EF4444]" />}
          title={t.auth.adminSignInRequired}
          action={
            <Button
              nativeButton={false}
              render={<Link href={adminLoginHref} />}
              className="border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC]"
            >
              {t.auth.loginToAdmin}
            </Button>
          }
        />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        {diagnostics}
        <AdminAccessCard
          icon={<ShieldAlert className="size-10 text-amber-400" />}
          title={t.auth.adminAccessRequired}
          subtitle={t.auth.noAdminPermissions}
          detail={
            <div className="space-y-3 text-left">
              <p className="text-sm text-[#94A3B8]">
                {t.auth.signedInAs}{" "}
                <span className="text-[#F8FAFC]">{user.email}</span>
              </p>
              <p className="text-xs leading-relaxed text-[#64748B]">
                {t.auth.promoteAdminHint}
              </p>
              <div className="rounded-lg border border-white/[0.06] bg-[#0B1118]/60 p-2 font-mono text-[10px] text-[#94A3B8]">
                <p>
                  {t.auth.diagnosticsUid}: {user.uid}
                </p>
                <p>
                  {t.auth.diagnosticsProfileLoaded}:{" "}
                  {profile ? t.auth.diagnosticsYes : t.auth.diagnosticsNo}
                </p>
                <p>
                  {t.auth.diagnosticsRole}: {profile?.role ?? "—"}
                </p>
                <p>
                  {t.auth.diagnosticsIsAdmin}:{" "}
                  {profile?.isAdmin === true
                    ? t.auth.diagnosticsYes
                    : profile?.isAdmin === false
                      ? t.auth.diagnosticsNo
                      : "—"}
                </p>
                <p>
                  {t.auth.diagnosticsResolvedAdmin}:{" "}
                  {isAdmin ? t.auth.diagnosticsYes : t.auth.diagnosticsNo}
                </p>
                {profileError ? (
                  <p className="mt-1 text-red-300/90">
                    {t.auth.diagnosticsProfileError}: {profileError}
                  </p>
                ) : null}
              </div>
            </div>
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/[0.08] text-[#CBD5E1]"
                disabled={adminLoading}
                onClick={() => void refreshProfile()}
              >
                {t.auth.refreshAccess}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/[0.08] text-[#CBD5E1]"
                onClick={() => void signOut()}
              >
                {t.auth.signOut}
              </Button>
            </div>
          }
        />
      </>
    );
  }

  return (
    <>
      {diagnostics}
      <AdminDashboard initialSubmissions={initialSubmissions} />
    </>
  );
}

function DevModeBanner({ message }: { message: string }) {
  const { t } = useLocale();
  return (
    <div className="mx-auto mb-4 max-w-[1920px] px-4 lg:px-6">
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
        <span className="font-semibold">{t.auth.developmentMode}: </span>
        {message}
      </p>
    </div>
  );
}

function AdminAccessCard({
  icon,
  title,
  subtitle,
  detail,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  detail?: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg items-center px-4 py-12 lg:px-6">
      <GlassPanel className="w-full p-8 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#151B24]/80">
          {icon}
        </div>
        <h1 className="font-heading text-xl font-bold text-[#F8FAFC]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm text-[#94A3B8]">{subtitle}</p>
        ) : null}
        {detail ? <div className="mt-4">{detail}</div> : null}
        <div className="mt-6 flex justify-center">{action}</div>
      </GlassPanel>
    </div>
  );
}
