"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

import { LoginCard } from "@/components/auth/LoginCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import { brand } from "@/lib/config/brand";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
  initialMode?: "signIn" | "signUp";
  nextPath?: string;
};

export function AuthModal({
  open,
  onClose,
  initialMode = "signIn",
  nextPath,
}: AuthModalProps) {
  const { t } = useLocale();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0B1118] shadow-[0_0_80px_-20px_rgba(59,130,246,0.4)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
          aria-hidden
        />
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 text-[#64748B] hover:text-[#CBD5E1]"
        >
          <X className="size-5" />
        </button>
        <div className="relative border-b border-white/[0.06] px-6 pb-4 pt-6">
          <Image
            src={brand.navLogoPath}
            alt={`${brand.appName} logo`}
            width={200}
            height={48}
            className="mx-auto h-8 w-auto max-w-[200px]"
          />
          <p className="mt-3 text-center font-heading text-sm font-semibold text-[#F8FAFC]">
            {brand.tagline}
          </p>
        </div>
        <div className="relative p-6">
          <LoginCard
            initialMode={initialMode}
            onSuccess={onClose}
            nextUrl={nextPath}
            showGarageNote={false}
            showInstagramNote={false}
            className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
          />
          <p className="mt-4 text-center text-xs text-[#64748B]">
            <Link
              href={
                nextPath
                  ? `${brand.nav.login.href}?next=${encodeURIComponent(nextPath)}`
                  : brand.nav.login.href
              }
              className="text-[#94A3B8] underline-offset-4 hover:text-[#CBD5E1] hover:underline"
              onClick={onClose}
            >
              {t.auth.openFullLogin}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
