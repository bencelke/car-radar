"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { mapFirebaseAuthError } from "@/components/auth/auth-errors";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

type LoginCardProps = {
  className?: string;
  onSuccess?: () => void;
  initialMode?: "signIn" | "signUp";
  showGarageNote?: boolean;
};

export function LoginCard({
  className,
  onSuccess,
  initialMode = "signIn",
  showGarageNote = true,
}: LoginCardProps) {
  const { t } = useLocale();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isFirebaseConfigured) {
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
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "signIn") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
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
      <div className="mb-5 flex gap-1 rounded-xl border border-white/[0.06] bg-[#151B24]/60 p-1">
        {(["signIn", "signUp"] as const).map((key) => (
          <button
            key={key}
            type="button"
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
            disabled={submitting}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            disabled={submitting}
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
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        <Button
          type="submit"
          disabled={submitting}
          className="h-10 w-full border border-[#EF4444]/50 bg-gradient-to-r from-[#EF4444]/30 to-[#A855F7]/25 text-[#F8FAFC] shadow-[0_0_28px_-8px_rgba(239,68,68,0.55)] hover:from-[#EF4444]/40 hover:to-[#A855F7]/35"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            t.auth.continue
          )}
        </Button>
      </form>

      {showGarageNote ? (
        <p className="mt-4 text-center text-[11px] leading-relaxed text-[#64748B]">
          {t.auth.garageNote}
        </p>
      ) : null}
    </div>
  );
}
