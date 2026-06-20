"use client";

import { Apple, AtSign, Mail } from "lucide-react";

import {
  elevatedPanelClass,
  sectionHeadingClass,
  statusBadgeClass,
} from "@/components/profile/profile-ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type ConnectedAccountsCardProps = {
  profile: UserProfile | null;
  loading?: boolean;
};

const PROVIDERS = [
  { id: "google.com", labelKey: "signedInWithGoogle" as const, icon: GoogleIcon },
  { id: "apple.com", labelKey: "signedInWithApple" as const, icon: Apple },
  { id: "password", labelKey: "signedInWithEmail" as const, icon: Mail },
] as const;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function ConnectedAccountsCard({
  profile,
  loading,
}: ConnectedAccountsCardProps) {
  const { t } = useLocale();
  const connected = new Set(profile?.authProviders ?? []);
  const instagramHandle = profile?.instagramHandle;

  if (loading) {
    return (
      <section className={cn(elevatedPanelClass, "animate-pulse p-5")}>
        <div className="h-4 w-36 rounded bg-white/10" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-white/5" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={cn(elevatedPanelClass, "p-5")}>
      <h2 className={sectionHeadingClass}>{t.profile.connectedAccounts}</h2>

      <ul className="mt-4 space-y-2">
        {PROVIDERS.map((provider) => {
          const Icon = provider.icon;
          const isConnected = connected.has(provider.id);
          return (
            <li
              key={provider.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#0B1118]/50 px-3 py-2.5"
            >
              <span className="inline-flex items-center gap-2.5 text-sm text-[#CBD5E1]">
                <Icon className="size-4 shrink-0 text-[#64748B]" />
                {t.profile[provider.labelKey]}
              </span>
              <span
                className={cn(
                  statusBadgeClass,
                  isConnected
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300/90"
                    : "border-white/[0.08] bg-white/[0.03] text-[#64748B]"
                )}
              >
                {isConnected ? t.profile.connected : t.profile.notConnected}
              </span>
            </li>
          );
        })}

        <li className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#0B1118]/50 px-3 py-2.5">
          <span className="inline-flex items-center gap-2.5 text-sm text-[#CBD5E1]">
            <AtSign className="size-4 shrink-0 text-[#64748B]" />
            {t.auth.instagramProfile}
          </span>
          <span
            className={cn(
              statusBadgeClass,
              instagramHandle
                ? "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#93C5FD]"
                : "border-white/[0.08] bg-white/[0.03] text-[#64748B]"
            )}
          >
            {instagramHandle ? t.profile.profileLinked : t.profile.notAdded}
          </span>
        </li>
      </ul>

      <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-[#64748B]">
        <AtSign className="mt-0.5 size-3 shrink-0" />
        {t.profile.instagramPublicHelper}
      </p>
    </section>
  );
}
