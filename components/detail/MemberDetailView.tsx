"use client";

import { useState } from "react";

import { RelatedEntityList } from "@/components/detail/RelatedEntityList";
import { RelatedSection } from "@/components/detail/RelatedSection";
import { MemberAdminTools } from "@/components/members/MemberAdminTools";
import { MemberClubPanel } from "@/components/members/MemberClubPanel";
import { MemberGarageSnapshot } from "@/components/members/MemberGarageSnapshot";
import { MemberIdentityCard } from "@/components/members/MemberIdentityCard";
import { MemberLocationPanel } from "@/components/members/MemberLocationPanel";
import { MemberProfileHero } from "@/components/members/MemberProfileHero";
import { MemberSocialPanel } from "@/components/members/MemberSocialPanel";
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
  member: initialMember,
  club,
  relatedShops = [],
  relatedEvents = [],
}: MemberDetailViewProps) {
  const { t } = useLocale();
  const [member, setMember] = useState(initialMember);

  const hasRelated = relatedShops.length > 0 || relatedEvents.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-3 px-1 sm:px-0">
      <MemberProfileHero member={member} club={club} />

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <MemberGarageSnapshot member={member} club={club} />
          <MemberIdentityCard member={member} club={club} />

          {hasRelated ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
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
          ) : null}
        </div>

        <aside className="flex flex-col gap-2">
          {club ? <MemberClubPanel member={member} club={club} /> : null}
          <MemberSocialPanel member={member} />
          <MemberLocationPanel member={member} />
        </aside>
      </div>

      <MemberAdminTools member={member} onMemberUpdate={setMember} />
    </div>
  );
}
