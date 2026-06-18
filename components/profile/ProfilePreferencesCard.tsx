"use client";

import Link from "next/link";
import { Bell, Eye, LogOut } from "lucide-react";

import { LanguageDropdown } from "@/components/language/LanguageDropdown";
import {
  elevatedPanelClass,
  sectionHeadingClass,
  sectionSubtextClass,
} from "@/components/profile/profile-ui";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { GarageProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

type ProfilePreferencesCardProps = {
  garage: GarageProfile | null;
  onSignOut: () => void;
};

export function ProfilePreferencesCard({
  garage,
  onSignOut,
}: ProfilePreferencesCardProps) {
  const { t } = useLocale();

  const visibilityLabel = garage
    ? {
        public: t.garage.public,
        club_only: t.garage.clubOnly,
        private: t.garage.private,
      }[garage.visibility]
    : "—";

  return (
    <section className={cn(elevatedPanelClass, "p-5")}>
      <h2 className={sectionHeadingClass}>{t.profile.preferences}</h2>
      <p className={sectionSubtextClass}>{t.profile.preferencesHint}</p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {t.profile.language}
          </p>
          <LanguageDropdown variant="standalone" />
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            <Bell className="size-3.5" />
            {t.profile.notificationPreferences}
          </p>
          <Link
            href="/notifications"
            className="inline-flex min-h-11 items-center text-sm text-[#3B82F6] hover:underline"
          >
            {t.notifications.viewAllNotifications}
          </Link>
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            <Eye className="size-3.5" />
            {t.profile.privacy}
          </p>
          <p className="text-sm text-[#CBD5E1]">
            {t.profile.publicProfile}:{" "}
            <span className="text-[#94A3B8]">{visibilityLabel}</span>
          </p>
          {garage ? (
            <Link
              href="/garage"
              className="mt-2 inline-flex text-xs text-[#64748B] hover:text-[#94A3B8] hover:underline"
            >
              {t.profile.editGarage}
            </Link>
          ) : null}
        </div>

        <div className="border-t border-white/[0.06] pt-4">
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 text-sm font-medium text-red-200/90 transition hover:bg-red-500/15"
          >
            <LogOut className="size-4" />
            {t.auth.signOut}
          </button>
        </div>
      </div>
    </section>
  );
}
