"use client";

import { CorrectionLink } from "@/components/detail/CorrectionLink";
import { RelatedEntityList } from "@/components/detail/RelatedEntityList";
import { RelatedSection } from "@/components/detail/RelatedSection";
import { FollowPlaceholderButton } from "@/components/members/FollowPlaceholderButton";
import { MemberBuildCard } from "@/components/members/MemberBuildCard";
import { MemberClubCard } from "@/components/members/MemberClubCard";
import { MemberProfileHeader } from "@/components/members/MemberProfileHeader";
import { MemberSocialLinks } from "@/components/members/MemberSocialLinks";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { CarEvent, CarShop, Club, ClubMember } from "@/lib/types";
import { eventDetailPath, shopDetailPath } from "@/lib/utils/entity-paths";

type MemberDetailViewProps = {
  member: ClubMember;
  club: Club | null;
  relatedShops?: CarShop[];
  relatedEvents?: CarEvent[];
};

export function MemberDetailView({
  member,
  club,
  relatedShops = [],
  relatedEvents = [],
}: MemberDetailViewProps) {
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <MemberProfileHeader member={member} club={club} />
      <div className="grid gap-4 lg:grid-cols-2">
        <MemberBuildCard member={member} />
        <div className="space-y-4">
          {club ? <MemberClubCard club={club} /> : null}
          <MemberSocialLinks member={member} />
          <FollowPlaceholderButton />
        </div>
      </div>
      {(relatedShops.length > 0 || relatedEvents.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {relatedShops.length > 0 ? (
            <RelatedSection title={t.detail.nearbyShops}>
              <RelatedEntityList
                items={relatedShops.slice(0, 5).map((shop) => ({
                  href: shopDetailPath(shop),
                  title: shop.name,
                  subtitle: shop.city,
                }))}
              />
            </RelatedSection>
          ) : null}
          {relatedEvents.length > 0 ? (
            <RelatedSection title={t.detail.relatedEvents}>
              <RelatedEntityList
                items={relatedEvents.slice(0, 5).map((event) => ({
                  href: eventDetailPath(event),
                  title: event.title,
                  subtitle: event.city,
                }))}
              />
            </RelatedSection>
          ) : null}
        </div>
      )}
      <CorrectionLink
        targetType="member"
        targetName={member.displayName}
        entityId={member.id}
      />
    </div>
  );
}
