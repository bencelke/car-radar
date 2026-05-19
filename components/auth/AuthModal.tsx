"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: "signIn" | "signUp";
};

export function AuthModal({
  open,
  onClose,
  initialMode = "signIn",
}: AuthModalProps) {
  const { t } = useLocale();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  if (!isFirebaseConfigured) {
    return (
      <AuthOverlay onClose={onClose}>
        <p className="text-sm text-[#94A3B8]">{t.auth.firebaseRequired}</p>
      </AuthOverlay>
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
      onClose();
    } catch {
      setError(t.auth.authError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthOverlay onClose={onClose}>
      <div className="mb-4 flex gap-1 rounded-lg border border-white/[0.06] bg-[#151B24]/60 p-0.5">
        {(["signIn", "signUp"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition",
              mode === key
                ? "bg-[#EF4444]/20 text-[#F8FAFC]"
                : "text-[#64748B]"
            )}
          >
            {key === "signIn" ? t.auth.signIn : t.auth.signUp}
          </button>
        ))}
      </div>

      <form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-full rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 text-sm text-[#F8FAFC] outline-none focus:border-[#EF4444]/40"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-[#64748B]">
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            autoComplete={
              mode === "signIn" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 w-full rounded-lg border border-white/[0.06] bg-[#151B24]/80 px-3 text-sm text-[#F8FAFC] outline-none focus:border-[#EF4444]/40"
          />
        </div>
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        <Button
          type="submit"
          disabled={submitting}
          className="w-full border border-[#EF4444]/50 bg-[#EF4444]/20 text-[#F8FAFC]"
        >
          {mode === "signIn" ? t.auth.signIn : t.auth.signUp}
        </Button>
      </form>
    </AuthOverlay>
  );
}

function AuthOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-xl border border-white/[0.08] bg-[#0B1118] p-6 shadow-xl">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 text-[#64748B] hover:text-[#CBD5E1]"
        >
          <X className="size-5" />
        </button>
        <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">
          CarRadar
        </h2>
        {children}
      </div>
    </div>
  );
}
