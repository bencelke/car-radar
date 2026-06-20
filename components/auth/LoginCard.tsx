"use client";

import { PremiumAuthCard } from "@/components/auth/PremiumAuthCard";
import { cn } from "@/lib/utils";

type LoginCardProps = {
  className?: string;
  onSuccess?: () => void;
  nextUrl?: string;
  initialMode?: "signIn" | "signUp";
  showGuest?: boolean;
};

/** @deprecated Prefer PremiumAuthCard on the login page. Kept for AuthModal compatibility. */
export function LoginCard({
  className,
  onSuccess,
  nextUrl,
  initialMode = "signIn",
  showGuest = true,
}: LoginCardProps) {
  return (
    <PremiumAuthCard
      className={cn(className)}
      onSuccess={onSuccess}
      nextUrl={nextUrl}
      initialMode={initialMode}
      showGuest={showGuest}
      embedded={className?.includes("border-0")}
    />
  );
}
