"use client";

import { useState } from "react";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AuthModal } from "@/components/auth/AuthModal";
import { GlassPanel } from "@/components/dashboard/glass-panel";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import type { Submission } from "@/lib/types";

type AdminGateProps = {
  initialSubmissions: Submission[];
};

export function AdminGate({ initialSubmissions }: AdminGateProps) {
  const { t } = useLocale();
  const {
    user,
    loading,
    adminLoading,
    isAdmin,
    isDevAdminBypass,
    signOut,
  } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  if (loading || (user && adminLoading && !isDevAdminBypass)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-[#64748B]" />
      </div>
    );
  }

  if (isDevAdminBypass) {
    return (
      <div>
        <DevModeBanner message={t.auth.devAdminDisabled} />
        <AdminDashboard initialSubmissions={initialSubmissions} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AdminAccessCard
          icon={<ShieldCheck className="size-10 text-[#EF4444]" />}
          title={t.auth.adminSignInRequired}
          action={
            <Button
              type="button"
              className="border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC]"
              onClick={() => setAuthOpen(true)}
            >
              {t.auth.openSignIn}
            </Button>
          }
        />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <AdminAccessCard
        icon={<ShieldAlert className="size-10 text-amber-400" />}
        title={t.auth.adminAccessRequired}
        subtitle={t.auth.noAdminPermissions}
        detail={
          <p className="text-sm text-[#94A3B8]">
            {t.auth.signedInAs}{" "}
            <span className="text-[#F8FAFC]">{user.email}</span>
          </p>
        }
        action={
          <Button
            type="button"
            variant="outline"
            className="border-white/[0.08] text-[#CBD5E1]"
            onClick={() => void signOut()}
          >
            {t.auth.signOut}
          </Button>
        }
      />
    );
  }

  return <AdminDashboard initialSubmissions={initialSubmissions} />;
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
