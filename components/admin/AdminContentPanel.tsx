"use client";

import { AdminComingSoon } from "@/components/admin/AdminComingSoon";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

const CONTENT_TYPES = [
  "contentTypeSceneUpdate",
  "contentTypeWeekendRoundup",
  "contentTypeClubSpotlight",
  "contentTypeFeaturedBuild",
  "contentTypeShopSpotlight",
  "contentTypeRouteAnnouncement",
  "contentTypeSafetyReminder",
  "contentTypePlatformAnnouncement",
] as const;

const OFFICIAL_IDENTITIES = [
  "identityShiftItTeam",
  "identitySceneRadar",
  "identityOfficialClubUpdate",
] as const;

export function AdminContentPanel() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <AdminEmptyState
        title={t.admin.noEditorialPosts}
        description={t.admin.contentEmptyHint}
      />

      <AdminSectionCard title={t.admin.editorialPlanTitle}>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CONTENT_TYPES.map((key) => (
            <li
              key={key}
              className="rounded-lg border border-white/[0.06] bg-[#0B1118]/60 px-3 py-2 text-sm text-[#CBD5E1]"
            >
              {t.admin[key]}
            </li>
          ))}
        </ul>
      </AdminSectionCard>

      <AdminSectionCard title={t.admin.editorialIdentitiesTitle}>
        <ul className="mb-4 space-y-1 text-sm text-[#94A3B8]">
          {OFFICIAL_IDENTITIES.map((key) => (
            <li key={key}>• {t.admin[key]}</li>
          ))}
        </ul>
        <AdminComingSoon description={t.admin.contentCreateComingNext} />
      </AdminSectionCard>

      <AdminSectionCard title={t.admin.contentPreviewTitle}>
        <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#151B24] to-[#0B1118] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
            {t.admin.identityShiftItTeam}
          </p>
          <p className="mt-2 font-heading text-base font-semibold text-[#F8FAFC]">
            {t.admin.contentPreviewHeadline}
          </p>
          <p className="mt-2 text-sm text-[#94A3B8]">
            {t.admin.contentPreviewBody}
          </p>
        </div>
      </AdminSectionCard>
    </div>
  );
}
