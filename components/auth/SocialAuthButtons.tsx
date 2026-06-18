"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  logSocialAuthError,
  mapFirebaseAuthError,
  unauthorizedDomainDetail,
} from "@/components/auth/auth-errors";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import {
  getAuthErrorCode,
  signInWithApple,
  signInWithGoogle,
} from "@/lib/auth/social-auth";
import { cn } from "@/lib/utils";

type SocialAuthButtonsProps = {
  nextUrl?: string;
  compact?: boolean;
  disabled?: boolean;
  onSuccess?: () => void;
  className?: string;
  /** Increment to clear provider errors when email auth is used. */
  clearErrorsSignal?: number;
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.46 2.21-1.24 3.01-.83.86-2.04 1.41-3.22 1.33-.14-1.09.42-2.25 1.15-3.02.79-.83 2.14-1.43 3.31-1.32zM20.88 17.09c-.57 1.3-.85 1.88-1.58 3.03-1.02 1.57-2.46 3.53-4.24 3.54-1.59.01-2-.99-4.16-.98-2.16.01-2.61 1-4.2.98-1.78-.01-3.14-1.8-4.16-3.37-2.86-4.38-3.16-9.51-1.39-12.24 1.25-1.92 3.23-3.04 5.08-3.04 1.89 0 3.08 1.01 4.64 1.01 1.5 0 2.42-1.01 4.58-1.01 1.64 0 3.38.89 4.63 2.43-4.07 2.22-3.41 8.01.8 9.65z" />
    </svg>
  );
}

export function SocialAuthButtons({
  nextUrl,
  compact = false,
  disabled = false,
  onSuccess,
  className,
  clearErrorsSignal = 0,
}: SocialAuthButtonsProps) {
  const { t } = useLocale();
  const {
    signInWithGoogle: signInGoogle,
    signInWithApple: signInApple,
    socialAuthLoadingProvider,
  } = useAuth();
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [appleError, setAppleError] = useState<string | null>(null);
  const [redirectFallback, setRedirectFallback] = useState<
    "google" | "apple" | null
  >(null);

  useEffect(() => {
    setGoogleError(null);
    setAppleError(null);
    setRedirectFallback(null);
  }, [clearErrorsSignal]);

  const busy = Boolean(socialAuthLoadingProvider) || disabled;

  async function handleProvider(
    provider: "google" | "apple",
    forceRedirect = false
  ) {
    setGoogleError(null);
    setAppleError(null);
    setRedirectFallback(null);

    try {
      if (forceRedirect) {
        if (provider === "google") {
          await signInWithGoogle(nextUrl, true);
        } else {
          await signInWithApple(nextUrl, true);
        }
        return;
      }

      const redirectPath =
        provider === "google"
          ? await signInGoogle(nextUrl)
          : await signInApple(nextUrl);

      if (redirectPath !== null) {
        onSuccess?.();
      }
    } catch (err) {
      logSocialAuthError(provider, err);
      const message = mapFirebaseAuthError(err, "signIn", t.auth, {
        provider,
      });
      if (provider === "google") {
        setGoogleError(message);
      } else {
        setAppleError(message);
      }
      if (getAuthErrorCode(err) === "auth/popup-blocked") {
        setRedirectFallback(provider);
      }
    }
  }

  const showGoogleHostname =
    googleError === t.auth.authUnauthorizedDomain &&
    typeof window !== "undefined";
  const showAppleHostname =
    appleError === t.auth.authUnauthorizedDomain &&
    typeof window !== "undefined";

  return (
    <div className={cn("space-y-3", className)}>
      <div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleProvider("google")}
          className={cn(
            "flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.12] bg-[#F8FAFC] px-4 text-sm font-medium text-[#1E293B] transition hover:bg-white disabled:opacity-60",
            compact && "min-h-11"
          )}
        >
          {socialAuthLoadingProvider === "google" ? (
            <Loader2 className="size-4 animate-spin text-[#1E293B]" />
          ) : (
            <GoogleIcon className="size-5 shrink-0" />
          )}
          <span>
            {socialAuthLoadingProvider === "google"
              ? t.auth.signingInWithGoogle
              : t.auth.continueWithGoogle}
          </span>
        </button>
        {googleError ? (
          <div className="mt-2 space-y-1">
            <p className="text-xs leading-relaxed text-red-300">{googleError}</p>
            {showGoogleHostname ? (
              <p className="text-[10px] text-[#64748B]">
                {unauthorizedDomainDetail(window.location.hostname)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleProvider("apple")}
          className={cn(
            "flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/[0.14] bg-black px-4 text-sm font-medium text-white transition hover:bg-[#111827] disabled:opacity-60",
            compact && "min-h-11"
          )}
        >
          {socialAuthLoadingProvider === "apple" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <AppleIcon className="size-5 shrink-0" />
          )}
          <span>
            {socialAuthLoadingProvider === "apple"
              ? t.auth.signingInWithApple
              : t.auth.continueWithApple}
          </span>
        </button>
        {appleError ? (
          <div className="mt-2 space-y-1">
            <p className="text-xs leading-relaxed text-red-300">{appleError}</p>
            {showAppleHostname ? (
              <p className="text-[10px] text-[#64748B]">
                {unauthorizedDomainDetail(window.location.hostname)}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {redirectFallback ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleProvider(redirectFallback, true)}
          className="w-full text-center text-xs text-[#94A3B8] underline-offset-4 hover:text-[#CBD5E1] hover:underline"
        >
          {t.auth.tryRedirectSignIn}
        </button>
      ) : null}
    </div>
  );
}
