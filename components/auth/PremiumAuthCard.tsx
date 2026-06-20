"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";

import { AuthDivider } from "@/components/auth/AuthDivider";
import { AuthProviderButton } from "@/components/auth/AuthProviderButton";
import { authUi } from "@/components/auth/auth-ui";
import {
  logSocialAuthError,
  mapFirebaseAuthError,
  unauthorizedDomainDetail,
} from "@/components/auth/auth-errors";
import { FirebaseProjectMismatchBanner } from "@/components/auth/FirebaseProjectMismatchBanner";
import { GuestBrowseButton } from "@/components/auth/GuestBrowseButton";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import {
  getAuthErrorCode,
  signInWithApple,
  signInWithFacebook,
  signInWithGoogle,
  type SocialAuthProviderId,
} from "@/lib/auth/social-auth";
import { isFacebookAuthEnabled } from "@/lib/auth/social-provider-availability";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import { useFirebaseConfigState } from "@/lib/hooks/useFirebaseConfigState";
import { cn } from "@/lib/utils";

type PremiumAuthCardProps = {
  className?: string;
  onSuccess?: () => void;
  nextUrl?: string;
  initialMode?: "signIn" | "signUp";
  showGuest?: boolean;
  embedded?: boolean;
};

export function PremiumAuthCard({
  className,
  onSuccess,
  nextUrl,
  initialMode = "signIn",
  showGuest = true,
  embedded = false,
}: PremiumAuthCardProps) {
  const { t } = useLocale();
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle: signInGoogle,
    signInWithApple: signInApple,
    signInWithFacebook: signInFacebook,
    socialAuthLoadingProvider,
  } = useAuth();

  const [mode, setMode] = useState<"signIn" | "signUp">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [redirectFallback, setRedirectFallback] =
    useState<SocialAuthProviderId | null>(null);

  const facebookEnabled = isFacebookAuthEnabled();
  const socialBusy = Boolean(socialAuthLoadingProvider);
  const { state, authBlocked } = useFirebaseConfigState();
  const controlsDisabled = authBlocked || state === "loading";
  const anyBusy = submitting || socialBusy || controlsDisabled;

  useEffect(() => {
    if (state === "ready") {
      setError(null);
      setSocialError(null);
    }
  }, [state]);

  if (!isFirebaseConfigured || state === "missing") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6 text-sm text-amber-100/90",
          className
        )}
        role="alert"
      >
        {t.auth.authConfigInvalid}
      </div>
    );
  }

  function clearSocialErrors() {
    setSocialError(null);
    setRedirectFallback(null);
  }

  async function handleProvider(
    provider: SocialAuthProviderId,
    forceRedirect = false
  ) {
    setError(null);
    setSocialError(null);
    setRedirectFallback(null);

    try {
      const fn =
        provider === "google"
          ? forceRedirect
            ? () => signInWithGoogle(nextUrl, true)
            : () => signInGoogle(nextUrl)
          : provider === "apple"
            ? forceRedirect
              ? () => signInWithApple(nextUrl, true)
              : () => signInApple(nextUrl)
            : forceRedirect
              ? () => signInWithFacebook(nextUrl, true)
              : () => signInFacebook(nextUrl);

      const redirectPath = await fn();
      if (redirectPath !== null) {
        onSuccess?.();
      }
    } catch (err) {
      logSocialAuthError(provider, err);
      setSocialError(
        mapFirebaseAuthError(err, "signIn", t.auth, { provider })
      );
      if (getAuthErrorCode(err) === "auth/popup-blocked") {
        setRedirectFallback(provider);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (controlsDisabled) return;
    setError(null);
    clearSocialErrors();
    setResetSent(false);
    setSubmitting(true);
    try {
      if (mode === "signIn") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onSuccess?.();
    } catch (err) {
      setError(mapFirebaseAuthError(err, mode, t.auth, { provider: "email" }));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    if (!auth) return;
    const trimmed = email.trim();
    if (!trimmed) {
      setError(t.auth.enterEmailForReset);
      return;
    }
    setError(null);
    clearSocialErrors();
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setResetSent(true);
    } catch (err) {
      setError(mapFirebaseAuthError(err, "signIn", t.auth, { provider: "email" }));
    } finally {
      setSubmitting(false);
    }
  }

  const showUnauthorizedDetail =
    socialError === t.auth.authUnauthorizedDomain &&
    typeof window !== "undefined";

  return (
    <div
      className={cn(
        embedded ? "space-y-5" : cn(authUi.card.shell, authUi.card.padding, authUi.card.width),
        className
      )}
    >
      <header className="space-y-2.5 text-center sm:text-left">
        <h2 className={authUi.type.cardHeading}>{t.auth.welcomeTitle}</h2>
        <p className={authUi.type.cardSubcopy}>{t.auth.welcomeSubcopy}</p>
      </header>

      <FirebaseProjectMismatchBanner />

      <fieldset
        disabled={controlsDisabled}
        className={cn(
          "min-w-0 border-0 p-0",
          controlsDisabled && "pointer-events-none opacity-50"
        )}
      >
        <div
          className="mt-5 space-y-3"
          role="group"
          aria-label={t.auth.socialSignInGroup}
        >
          <AuthProviderButton
            variant="google"
            label={t.auth.continueWithGoogle}
            loadingLabel={t.auth.signingInWithGoogle}
            loading={socialAuthLoadingProvider === "google"}
            disabled={anyBusy && socialAuthLoadingProvider !== "google"}
            onClick={() => void handleProvider("google")}
          />
          <AuthProviderButton
            variant="apple"
            label={t.auth.continueWithApple}
            loadingLabel={t.auth.signingInWithApple}
            loading={socialAuthLoadingProvider === "apple"}
            disabled={anyBusy && socialAuthLoadingProvider !== "apple"}
            onClick={() => void handleProvider("apple")}
          />
          {facebookEnabled ? (
            <AuthProviderButton
              variant="facebook"
              label={t.auth.continueWithFacebook}
              loadingLabel={t.auth.signingInWithFacebook}
              loading={socialAuthLoadingProvider === "facebook"}
              disabled={anyBusy && socialAuthLoadingProvider !== "facebook"}
              onClick={() => void handleProvider("facebook")}
            />
          ) : null}
        </div>

        {socialError ? (
          <div className="mt-3 space-y-1.5" role="alert">
            <p className="text-xs leading-relaxed text-red-300">{socialError}</p>
            {showUnauthorizedDetail ? (
              <p className={authUi.type.helper}>
                {unauthorizedDomainDetail(window.location.hostname)}
              </p>
            ) : null}
            {redirectFallback ? (
              <button
                type="button"
                disabled={anyBusy}
                onClick={() => void handleProvider(redirectFallback, true)}
                className="text-xs text-[#94A3B8] underline-offset-4 hover:text-[#CBD5E1] hover:underline"
              >
                {t.auth.tryRedirectSignIn}
              </button>
            ) : null}
          </div>
        ) : null}

        <AuthDivider label={t.auth.orContinueWithEmail} />

        <div
          className={authUi.tabs.shell}
          role="tablist"
          aria-label={t.auth.emailModeTabs}
        >
          {(["signIn", "signUp"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              disabled={anyBusy}
              onClick={() => {
                setMode(key);
                setError(null);
                clearSocialErrors();
                setResetSent(false);
              }}
              className={cn(
                authUi.tabs.item,
                mode === key ? authUi.tabs.active : authUi.tabs.inactive
              )}
            >
              {key === "signIn" ? t.auth.signIn : t.auth.createAccount}
            </button>
          ))}
        </div>

        <form className="mt-5 space-y-4" onSubmit={(e) => void handleSubmit(e)} noValidate>
          <div>
            <label htmlFor="auth-email" className={cn(authUi.type.label, authUi.type.labelGap)}>
              {t.auth.emailLabel}
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              disabled={anyBusy}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={clearSocialErrors}
              className={authUi.input}
            />
          </div>

          <div>
            <div className="mb-2 flex items-start justify-between gap-3">
              <label htmlFor="auth-password" className={authUi.type.label}>
                {t.auth.passwordLabel}
              </label>
              {mode === "signIn" ? (
                <button
                  type="button"
                  disabled={anyBusy}
                  onClick={() => void handleForgotPassword()}
                  className="-mt-0.5 shrink-0 text-xs leading-snug text-[#64748B] underline-offset-4 hover:text-[#CBD5E1] hover:underline"
                >
                  {t.auth.forgotPassword}
                </button>
              ) : null}
            </div>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                disabled={anyBusy}
                autoComplete={
                  mode === "signIn" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(authUi.input, "pr-11")}
              />
              <button
                type="button"
                aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                disabled={anyBusy}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#64748B] hover:text-[#CBD5E1]"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
            {mode === "signUp" ? (
              <p className={cn("mt-2", authUi.type.helper)}>{t.auth.passwordHint}</p>
            ) : null}
          </div>

          {resetSent ? (
            <p className="text-xs leading-relaxed text-[#86EFAC]" role="status">
              {t.auth.passwordResetSent}
            </p>
          ) : null}

          {error ? (
            <p className="text-xs leading-relaxed text-red-300" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={anyBusy}
            className={authUi.button.primary}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              t.auth.continue
            )}
          </Button>
        </form>

        <p className={cn("mt-4", authUi.type.legal)}>
          {t.auth.legalConsentPrefix}{" "}
          <Link
            href="/terms"
            className="text-[#A8B4C7] underline-offset-4 hover:text-[#E2E8F0] hover:underline"
          >
            {t.auth.terms}
          </Link>{" "}
          {t.auth.legalConsentMiddle}{" "}
          <Link
            href="/privacy"
            className="text-[#A8B4C7] underline-offset-4 hover:text-[#E2E8F0] hover:underline"
          >
            {t.auth.privacyPolicy}
          </Link>
          .
        </p>

        {showGuest ? (
          <>
            <AuthDivider label={t.auth.orBrowseAsGuest} className="!mt-5 !mb-0" />
            <GuestBrowseButton nextUrl={nextUrl} disabled={anyBusy} className="mt-4" />
          </>
        ) : null}
      </fieldset>
    </div>
  );
}
