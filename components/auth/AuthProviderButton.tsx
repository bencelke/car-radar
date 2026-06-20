"use client";

import { Loader2 } from "lucide-react";

import { authUi } from "@/components/auth/auth-ui";
import { cn } from "@/lib/utils";

export type AuthProviderVariant = "google" | "apple" | "facebook";

type AuthProviderButtonProps = {
  variant: AuthProviderVariant;
  label: string;
  loadingLabel: string;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
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

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.024 4.388 11.015 10.125 11.878v-8.385H7.078v-3.493h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.493h-2.796v8.385C19.612 23.088 24 18.097 24 12.073z" />
    </svg>
  );
}

const VARIANT_STYLES: Record<AuthProviderVariant, string> = {
  google:
    "border-white/[0.14] bg-[#F1F5F9] text-[#1E293B] hover:bg-[#E2E8F0] focus-visible:ring-[#4285F4]/35",
  apple:
    "border-white/[0.16] bg-[#05070A] text-white hover:bg-[#111827] focus-visible:ring-white/25",
  facebook:
    "border-[#1877F2]/35 bg-gradient-to-b from-[#1877F2] to-[#166FE5] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] hover:from-[#1a7df4] hover:to-[#1565d8] focus-visible:ring-[#1877F2]/45",
};

const PROVIDER_LABELS: Record<AuthProviderVariant, string> = {
  google: "Google",
  apple: "Apple",
  facebook: "Facebook",
};

export function AuthProviderButton({
  variant,
  label,
  loadingLabel,
  loading,
  disabled = false,
  onClick,
  className,
}: AuthProviderButtonProps) {
  const Icon =
    variant === "google" ? GoogleIcon : variant === "apple" ? AppleIcon : FacebookIcon;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={loading ? loadingLabel : label}
      className={cn(authUi.button.provider, VARIANT_STYLES[variant], className)}
    >
      {loading ? (
        <Loader2
          className={cn(
            "size-5 shrink-0 animate-spin",
            variant === "google" ? "text-[#1E293B]" : "text-white"
          )}
        />
      ) : (
        <Icon className="size-5 shrink-0" />
      )}
      <span className="truncate">{loading ? loadingLabel : label}</span>
      <span className="sr-only">{PROVIDER_LABELS[variant]}</span>
    </button>
  );
}
