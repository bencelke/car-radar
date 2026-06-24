"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import {
  logPostLoginNavigation,
  needsProfileOnboarding,
  resolvePostLoginDestination,
} from "@/lib/auth/post-login-navigation";
import { consumeAuthNext } from "@/lib/auth/social-auth";
import { ROUTES } from "@/lib/config/routes";

function readNextQueryParam(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("next");
}

function isLoginPath(pathname: string): boolean {
  return pathname === ROUTES.login || pathname.startsWith(`${ROUTES.login}/`);
}

/**
 * Completes navigation after sign-in (email, popup, or OAuth redirect).
 * Runs globally so redirect is not tied only to the login page component tree.
 */
export function PostAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const redirectStartedRef = useRef(false);
  const consumedStoredNextRef = useRef(false);
  const {
    user,
    loading,
    profile,
    adminLoading,
    postAuthRedirect,
    clearPostAuthRedirect,
  } = useAuth();

  useEffect(() => {
    if (!user) {
      redirectStartedRef.current = false;
      consumedStoredNextRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;

    const onLoginPage = isLoginPath(pathname);
    if (!onLoginPage && !postAuthRedirect) return;
    if (adminLoading) return;

    let storedNext: string | null = null;
    if (onLoginPage && !consumedStoredNextRef.current && !postAuthRedirect) {
      consumedStoredNextRef.current = true;
      storedNext = consumeAuthNext();
    }

    const rawNext = postAuthRedirect ?? storedNext ?? readNextQueryParam();
    const destination = resolvePostLoginDestination({
      nextUrl: rawNext,
      profile,
    });

    if (redirectStartedRef.current) return;
    redirectStartedRef.current = true;

    logPostLoginNavigation("redirect after auth", {
      uid: user.uid,
      email: user.email ?? null,
      pathname,
      destination,
      profileOnboarding: needsProfileOnboarding(profile),
      hadPostAuthRedirect: Boolean(postAuthRedirect),
      hadStoredNext: Boolean(storedNext),
      hadNextQuery: Boolean(readNextQueryParam()),
    });

    if (postAuthRedirect) clearPostAuthRedirect();
    router.replace(destination);
    router.refresh();
  }, [
    loading,
    user,
    profile,
    adminLoading,
    postAuthRedirect,
    pathname,
    router,
    clearPostAuthRedirect,
  ]);

  return null;
}
