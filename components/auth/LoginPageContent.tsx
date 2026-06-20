"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { authUi } from "@/components/auth/auth-ui";
import { PremiumAuthCard } from "@/components/auth/PremiumAuthCard";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { sanitizeNextPath } from "@/lib/auth/sanitize-next-path";
import { brand } from "@/lib/config/brand";
import { cn } from "@/lib/utils";

export function LoginPageContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const initialMode =
    searchParams.get("mode") === "signUp" ? "signUp" : "signIn";
  const { user, loading, isAdmin, signOut } = useAuth();

  const handleSuccess = useCallback(() => {
    router.replace(nextPath);
    router.refresh();
  }, [router, nextPath]);

  return (
    <div className="relative min-h-[calc(100dvh-3.5rem)] overflow-x-clip pb-[max(1rem,env(safe-area-inset-bottom))] sm:min-h-[calc(100dvh-4rem)]">
      <div className="pointer-events-none absolute inset-0 bg-[#05070A]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.045) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-[18%] size-[480px] -translate-x-1/3 rounded-full bg-[#EF4444]/8 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-[32%] size-[520px] translate-x-1/4 rounded-full bg-[#3B82F6]/10 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-[1220px] flex-col px-4 py-6 sm:min-h-[calc(100dvh-4rem)] sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-8 lg:py-10 xl:gap-20">
        <div className="hidden w-full lg:flex lg:w-[54%] lg:items-center">
          <AuthBrandPanel className="w-full" />
        </div>

        <div className="relative mx-auto flex w-full flex-col lg:mx-0 lg:w-[42%] lg:max-w-[460px] lg:shrink-0">
          <div
            className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-[#3B82F6]/6 blur-2xl lg:-inset-6"
            aria-hidden
          />

          {loading ? (
            <div
              className={cn(
                authUi.card.shell,
                authUi.card.padding,
                authUi.card.width,
                "mx-auto h-[28rem] animate-pulse bg-[#0B1118]/60"
              )}
              aria-hidden
            />
          ) : user ? (
            <SignedInPanel
              email={user.email ?? ""}
              isAdmin={isAdmin}
              onSignOut={() => void signOut()}
            />
          ) : (
            <PremiumAuthCard
              className="relative mx-auto"
              onSuccess={handleSuccess}
              nextUrl={nextPath}
              initialMode={initialMode}
            />
          )}

          {!loading && !user ? (
            <div className="relative mt-8 lg:hidden">
              <AuthBrandPanel benefitsOnly />
            </div>
          ) : null}
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
    <div
      className={cn(
        authUi.card.shell,
        authUi.card.padding,
        authUi.card.width,
        "relative mx-auto"
      )}
    >
      <p className={authUi.type.cardHeading}>{t.auth.signedInTitle}</p>
      <p className={cn("mt-2", authUi.type.cardSubcopy)}>{email}</p>
      <div className="mt-6 flex flex-col gap-2.5">
        <Button
          nativeButton={false}
          render={<Link href={brand.nav.profile.href} />}
          className={authUi.button.primary}
        >
          {t.auth.goToProfile}
        </Button>
        {isAdmin ? (
          <Button
            nativeButton={false}
            render={<Link href={brand.nav.admin.href} />}
            className="h-[3.25rem] w-full border border-[#EF4444]/40 bg-[#EF4444]/15 text-[#F8FAFC]"
          >
            {t.auth.goToAdmin}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          className="h-[3.25rem] w-full border-white/[0.08] text-[#CBD5E1]"
          onClick={onSignOut}
        >
          {t.auth.signOut}
        </Button>
      </div>
    </div>
  );
}
