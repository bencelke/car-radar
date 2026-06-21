"use client";

import { AdminComingSoon } from "@/components/admin/AdminComingSoon";
import { AdminSectionCard } from "@/components/admin/AdminSectionCard";
import { useLocale } from "@/components/providers/LocaleProvider";

type PlacementSection = {
  titleKey: keyof typeof import("@/lib/i18n/en").en.admin;
  purposeKey: keyof typeof import("@/lib/i18n/en").en.admin;
  collection: string;
};

const PLACEMENTS: PlacementSection[] = [
  {
    titleKey: "placementFeaturedClubs",
    purposeKey: "placementFeaturedClubsPurpose",
    collection: "featured_placements / clubs",
  },
  {
    titleKey: "placementFeaturedShops",
    purposeKey: "placementFeaturedShopsPurpose",
    collection: "featured_placements / shops",
  },
  {
    titleKey: "placementFeaturedEvents",
    purposeKey: "placementFeaturedEventsPurpose",
    collection: "featured_placements / events",
  },
  {
    titleKey: "placementHomepageSpotlight",
    purposeKey: "placementHomepageSpotlightPurpose",
    collection: "advertising_placements",
  },
  {
    titleKey: "placementMapPins",
    purposeKey: "placementMapPinsPurpose",
    collection: "advertising_placements",
  },
  {
    titleKey: "placementCitySpotlight",
    purposeKey: "placementCitySpotlightPurpose",
    collection: "advertising_placements",
  },
  {
    titleKey: "placementEventSponsor",
    purposeKey: "placementEventSponsorPurpose",
    collection: "advertising_placements",
  },
];

export function AdminAdvertisingPanel() {
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#94A3B8]">{t.admin.advertisingManualNote}</p>

      {PLACEMENTS.map((section) => (
        <AdminSectionCard
          key={section.titleKey}
          title={t.admin[section.titleKey]}
          subtitle={t.admin[section.purposeKey]}
        >
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-[#64748B]">
              {t.admin.targetCollection}: {section.collection}
            </p>
            <ul className="grid gap-1 text-xs text-[#94A3B8] sm:grid-cols-2">
              <li>• targetId</li>
              <li>• placementType</li>
              <li>• city / area</li>
              <li>• startsAt / endsAt</li>
              <li>• priority</li>
              <li>• status</li>
            </ul>
            <AdminComingSoon description={t.admin.placementCreateComingNext} />
          </div>
        </AdminSectionCard>
      ))}
    </div>
  );
}
