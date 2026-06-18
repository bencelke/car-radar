"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { AuthBrandHero } from "@/components/auth/AuthBrandHero";
import { LoginCard } from "@/components/auth/LoginCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { sanitizeNextPath } from "@/lib/auth/sanitize-next-path";
import { brand } from "@/lib/config/brand";

export function LoginPageContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const { user, loading, isAdmin, signOut } = useAuth();

  const handleSuccess = useCallback(() => {
    router.replace(nextPath);
    router.refresh();
  }, [router, nextPath]);

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip">
      <div
        className="pointer-events-none absolute inset-0 bg-[#05070A]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-1/4 top-1/4 size-[520px] rounded-full bg-[#EF4444]/15 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-1/4 bottom-0 size-[480px] rounded-full bg-[#3B82F6]/15 blur-[120px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 size-[360px] -translate-x-1/2 rounded-full bg-[#A855F7]/10 blur-[100px]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-8 lg:py-14">
        <div className="flex-1 lg:max-w-xl">
          <AuthBrandHero compact={false} />
          <ul className="mt-6 flex flex-wrap gap-2 sm:hidden">
            {[t.auth.bulletClubs, t.auth.bulletBuilds, t.auth.bulletSubmit].map(
              (text) => (
                <li
                  key={text}
                  className="rounded-full border border-white/[0.08] bg-[#0B1118]/60 px-3 py-1 text-[10px] text-[#94A3B8]"
                >
                  {text}
                </li>
              )
            )}
          </ul>
        </div>

        <div className="w-full max-w-md shrink-0 lg:max-w-[420px]">
          {loading ? (
            <div className="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-[#0B1118]/60" />
          ) : user ? (
            <SignedInPanel
              email={user.email ?? ""}
              isAdmin={isAdmin}
              onSignOut={() => void signOut()}
            />
          ) : (
            <LoginCard
              onSuccess={handleSuccess}
              nextUrl={nextPath}
              showGarageNote
            />
          )}

          <p className="mt-6 text-center text-sm">
            <Link
              href="/map"
              className="text-[#64748B] underline-offset-4 transition hover:text-[#CBD5E1] hover:underline"
            >
              {t.auth.continueExploring}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function SignedInPanel({
  email,
  isAdmin,
  onSignOut,
}: {
  email: string;
  isAdmin: boolean;
  onSignOut: () => void;
}) {
  const { t } = useLocale();

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-[#0B1118]/70 p-6 backdrop-blur-xl">
      <p className="font-heading text-lg font-semibold text-[#F8FAFC]">
        {t.auth.signedInTitle}
      </p>
      <p className="mt-2 text-sm text-[#94A3B8]">{email}</p>
      <div className="mt-6 flex flex-col gap-2">
        <Button
          nativeButton={false}
          render={<Link href={brand.nav.profile.href} />}
          className="w-full border border-[#3B82F6]/40 bg-[#3B82F6]/20 text-[#F8FAFC]"
        >
          {t.auth.goToProfile}
        </Button>
        {isAdmin ? (
          <Button
            nativeButton={false}
            render={<Link href={brand.nav.admin.href} />}
            className="w-full border border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC]"
          >
            {t.auth.goToAdmin}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="w-full border-white/[0.08] text-[#CBD5E1]"
          onClick={onSignOut}
        >
          {t.auth.signOut}
        </Button>
      </div>
    </div>
  );
}
