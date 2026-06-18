"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { mapFirebaseAuthError } from "@/components/auth/auth-errors";
import {
  FirebaseProjectDevDiagnostics,
  FirebaseProjectMismatchBanner,
} from "@/components/auth/FirebaseProjectMismatchBanner";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { useFirebaseConfigState } from "@/lib/hooks/useFirebaseConfigState";
import { cn } from "@/lib/utils";

type LoginCardProps = {
  className?: string;
  onSuccess?: () => void;
  nextUrl?: string;
  initialMode?: "signIn" | "signUp";
  showGarageNote?: boolean;
  showInstagramNote?: boolean;
};

export function LoginCard({
  className,
  onSuccess,
  nextUrl,
  initialMode = "signIn",
  showGarageNote = true,
  showInstagramNote = true,
}: LoginCardProps) {
  const { t } = useLocale();
  const { signInWithEmail, signUpWithEmail, socialAuthLoadingProvider } =
    useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [socialClearSignal, setSocialClearSignal] = useState(0);

  const socialBusy = Boolean(socialAuthLoadingProvider);
  const { state, check, authBlocked } = useFirebaseConfigState();
  const controlsDisabled = authBlocked || state === "loading";

  useEffect(() => {
    if (state === "ready") {
      setError(null);
      setSocialClearSignal((n) => n + 1);
    }
  }, [state]);

  if (!isFirebaseConfigured || state === "missing") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-amber-500/25 bg-amber-500/10 p-6 text-sm text-amber-100/90",
          className
        )}
      >
        {t.auth.firebaseNotConfigured}
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (controlsDisabled) return;
    setError(null);
    setSocialClearSignal((n) => n + 1);
    setSubmitting(true);
    try {
      if (mode === "signIn") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onSuccess?.();
    } catch (err) {
      setError(mapFirebaseAuthError(err, mode, t.auth));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.1] bg-[#0B1118]/70 p-6 shadow-[0_0_60px_-20px_rgba(59,130,246,0.35)] backdrop-blur-xl",
        className
      )}
    >
      <FirebaseProjectMismatchBanner />

      <fieldset
        disabled={controlsDisabled}
        className={cn(
          "min-w-0 border-0 p-0",
          controlsDisabled && "pointer-events-none opacity-50"
        )}
      >
      <SocialAuthButtons
        nextUrl={nextUrl}
        disabled={submitting || controlsDisabled}
        onSuccess={onSuccess}
        clearErrorsSignal={socialClearSignal}
      />

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
          {t.auth.orContinueWithEmail}
        </span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <div className="mb-5 flex gap-1 rounded-xl border border-white/[0.06] bg-[#151B24]/60 p-1">
        {(["signIn", "signUp"] as const).map((key) => (
          <button
            key={key}
            type="button"
            disabled={submitting || socialBusy || controlsDisabled}
            onClick={() => {
              setMode(key);
              setError(null);
            }}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
              mode === key
                ? "bg-gradient-to-r from-[#EF4444]/25 to-[#3B82F6]/25 text-[#F8FAFC] shadow-[inset_0_0_20px_-8px_rgba(239,68,68,0.5)]"
                : "text-[#64748B] hover:text-[#CBD5E1]"
            )}
          >
            {key === "signIn" ? t.auth.signIn : t.auth.createAccount}
          </button>
        ))}
      </div>

      <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {t.auth.emailLabel}
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            disabled={submitting || socialBusy || controlsDisabled}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setSocialClearSignal((n) => n + 1)}
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#151B24]/80 px-3 text-sm text-[#F8FAFC] outline-none transition focus:border-[#3B82F6]/50 focus:shadow-[0_0_20px_-8px_rgba(59,130,246,0.6)] disabled:opacity-60"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {t.auth.passwordLabel}
          </label>
          <input
            type="password"
            required
            minLength={6}
            disabled={submitting || socialBusy || controlsDisabled}
            autoComplete={
              mode === "signIn" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-[#151B24]/80 px-3 text-sm text-[#F8FAFC] outline-none transition focus:border-[#EF4444]/40 focus:shadow-[0_0_20px_-8px_rgba(239,68,68,0.45)] disabled:opacity-60"
          />
          {mode === "signUp" ? (
            <p className="mt-1.5 text-[10px] text-[#64748B]">
              {t.auth.passwordHint}
            </p>
          ) : null}
        </div>
        {error ? (
          <p className="text-xs leading-relaxed text-red-300">{error}</p>
        ) : null}
        <Button
          type="submit"
          disabled={submitting || socialBusy || controlsDisabled}
          className="h-12 w-full border border-[#EF4444]/50 bg-gradient-to-r from-[#EF4444]/30 to-[#A855F7]/25 text-[#F8FAFC] shadow-[0_0_28px_-8px_rgba(239,68,68,0.55)] hover:from-[#EF4444]/40 hover:to-[#A855F7]/35"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            t.auth.continue
          )}
        </Button>
      </form>
      </fieldset>

      <FirebaseProjectDevDiagnostics check={check} state={state} />

      {showInstagramNote ? (
        <div className="mt-4 space-y-2 border-t border-white/[0.06] pt-4">
          <p className="text-center text-[11px] leading-relaxed text-[#64748B]">
            {t.auth.instagramConnectAfterSignIn}
          </p>
          <p className="text-center text-[10px] text-[#475569]">
            <Link
              href="/profile"
              className="text-[#94A3B8] underline-offset-4 hover:text-[#CBD5E1] hover:underline"
            >
              {t.auth.addInstagramFromProfile}
            </Link>
          </p>
        </div>
      ) : null}

      {showGarageNote ? (
        <p className="mt-4 text-center text-[11px] leading-relaxed text-[#64748B]">
          {t.auth.garageNote}
        </p>
      ) : null}
    </div>
  );
}
