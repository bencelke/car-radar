"use client";

import { AdminComingSoon } from "@/components/admin/AdminComingSoon";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

type SettingToggle = {
  labelKey: keyof typeof import("@/lib/i18n/en").en.admin;
  descriptionKey: keyof typeof import("@/lib/i18n/en").en.admin;
};

const TOGGLES: SettingToggle[] = [
  { labelKey: "settingPublicSubmissions", descriptionKey: "settingPublicSubmissionsDesc" },
  { labelKey: "settingGuestBrowsing", descriptionKey: "settingGuestBrowsingDesc" },
  { labelKey: "settingUserRegistration", descriptionKey: "settingUserRegistrationDesc" },
  { labelKey: "settingClaims", descriptionKey: "settingClaimsDesc" },
  { labelKey: "settingPostsComments", descriptionKey: "settingPostsCommentsDesc" },
  { labelKey: "settingRsvp", descriptionKey: "settingRsvpDesc" },
  { labelKey: "settingBusinessListings", descriptionKey: "settingBusinessListingsDesc" },
  { labelKey: "settingAdvertising", descriptionKey: "settingAdvertisingDesc" },
  { labelKey: "settingNotifications", descriptionKey: "settingNotificationsDesc" },
  { labelKey: "settingDefaultMapCity", descriptionKey: "settingDefaultMapCityDesc" },
  { labelKey: "settingSupportedCountries", descriptionKey: "settingSupportedCountriesDesc" },
  { labelKey: "settingSupportedLanguages", descriptionKey: "settingSupportedLanguagesDesc" },
  { labelKey: "settingMaintenanceMode", descriptionKey: "settingMaintenanceModeDesc" },
];

function DisabledToggle({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-white/[0.06] bg-[#0B1118]/40 px-3 py-3">
      <div>
        <p className="text-sm font-medium text-[#CBD5E1]">{label}</p>
        <p className="mt-1 text-xs text-[#64748B]">{description}</p>
      </div>
      <button
        type="button"
        disabled
        className="relative h-6 w-11 shrink-0 cursor-not-allowed rounded-full bg-[#334155] opacity-60"
        title="Coming next"
      >
        <span className="absolute left-1 top-1 size-4 rounded-full bg-[#64748B]" />
      </button>
    </div>
  );
}

export function AdminSettingsPanel() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#94A3B8]">{t.admin.settingsSafeNote}</p>

      <AdminSectionCard title={t.admin.featureFlagsTitle}>
        <div className="space-y-2">
          {TOGGLES.map((item) => (
            <DisabledToggle
              key={item.labelKey}
              label={t.admin[item.labelKey]}
              description={`${t.admin[item.descriptionKey]} — ${t.admin.notConnectedYet}`}
            />
          ))}
        </div>
      </AdminSectionCard>

      <AdminComingSoon description={t.admin.settingsComingSoon} />
    </div>
  );
}
