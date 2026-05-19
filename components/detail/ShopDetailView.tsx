"use client";

import { CorrectionLink } from "@/components/detail/CorrectionLink";
import { DetailHero } from "@/components/detail/DetailHero";
import { DirectionsButton } from "@/components/detail/DirectionsButton";
import { InfoGrid } from "@/components/detail/InfoGrid";
import { RelatedEntityList } from "@/components/detail/RelatedEntityList";
import { RelatedSection } from "@/components/detail/RelatedSection";
import { SocialLinks, type SocialLinkItem } from "@/components/detail/SocialLinks";
import { useLocale } from "@/components/providers/LocaleProvider";
import { categoryToLabel } from "@/lib/mappers/ui";
import type { CarEvent, CarShop, Club } from "@/lib/types";
import { clubDetailPath, eventDetailPath } from "@/lib/utils/entity-paths";

type ShopDetailViewProps = {
  shop: CarShop;
  relatedClubs: Club[];
  relatedEvents: CarEvent[];
};

export function ShopDetailView({
  shop,
  relatedClubs,
  relatedEvents,
}: ShopDetailViewProps) {
  const { t } = useLocale();
  const location = [shop.address, shop.city, shop.country]
    .filter(Boolean)
    .join(" · ");

  const socialLinks: SocialLinkItem[] = [];
  if (shop.instagram) {
    socialLinks.push({
      href: shop.instagram,
      label: t.detail.visitInstagram,
      kind: "instagram",
    });
  }
  if (shop.website) {
    socialLinks.push({
      href: shop.website,
      label: t.detail.visitWebsite,
      kind: "website",
    });
  }

  return (
    <div className="space-y-6">
      <DetailHero
        title={shop.name}
        typeBadge={categoryToLabel(shop.category)}
        verified={shop.verified}
        verifiedLabel={t.map.verified}
        location={location}
        gradientClassName="from-red-600/40 via-[#111827] to-orange-900/30"
      >
        {shop.description ? (
          <p className="text-sm leading-relaxed text-[#94A3B8]">
            {shop.description}
          </p>
        ) : null}
      </DetailHero>

      <InfoGrid
        items={[
          { label: t.detail.services, value: shop.services?.join(", ") },
          {
            label: t.detail.brandsSupported,
            value: shop.brandsSupported?.join(", "),
          },
          {
            label: "Rating",
            value:
              shop.rating != null && shop.rating > 0
                ? `★ ${shop.rating.toFixed(1)}${
                    shop.reviewCount ? ` (${shop.reviewCount} reviews)` : ""
                  }`
                : null,
          },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {shop.lat != null && shop.lng != null ? (
          <DirectionsButton
            lat={shop.lat}
            lng={shop.lng}
            label={t.detail.directions}
          />
        ) : (
          <div />
        )}
        <SocialLinks title={t.detail.socialLinks} links={socialLinks} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RelatedSection title={t.detail.relatedEvents}>
          <RelatedEntityList
            items={relatedEvents.slice(0, 6).map((event) => ({
              href: eventDetailPath(event),
              title: event.title,
              subtitle: `${event.type} · ${event.city}`,
            }))}
          />
        </RelatedSection>
        <RelatedSection title={t.detail.relatedClubs}>
          <RelatedEntityList
            items={relatedClubs.slice(0, 6).map((club) => ({
              href: clubDetailPath(club),
              title: club.name,
              subtitle: `${club.type} · ${club.city}`,
            }))}
          />
        </RelatedSection>
      </div>

      <CorrectionLink
        targetType="shop"
        targetName={shop.name}
        entityId={shop.id}
      />
    </div>
  );
}
