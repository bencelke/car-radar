"use client";

import { HomeExploreEvents } from "@/components/home/HomeExploreEvents";
import { HomeFeaturedCommunities } from "@/components/home/HomeFeaturedCommunities";
import { HomeFeaturedEvent } from "@/components/home/HomeFeaturedEvent";
import { HomeMapPreview } from "@/components/home/HomeMapPreview";
import { HomeMobileActionBar } from "@/components/home/HomeMobileActionBar";
import { HomeSceneCTA } from "@/components/home/HomeSceneCTA";
import { HomeSceneHero } from "@/components/home/HomeSceneHero";
import { HomeScenePulse } from "@/components/home/HomeScenePulse";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { HomeShopsNearYou } from "@/components/home/HomeShopsNearYou";
import { useLocale } from "@/components/providers/LocaleProvider";
import { brand } from "@/lib/config/brand";
import type { DashboardData } from "@/lib/data/dashboard";

type HomeSceneViewProps = DashboardData;

export function HomeSceneView({
  stats,
  featuredEvent,
  rawEvents,
  rawShops,
  rawClubs,
  mapItems,
  mapPins,
}: HomeSceneViewProps) {
  const { t } = useLocale();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05070a]">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-[#05070a] via-transparent to-[#05070a]" />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 pb-24 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:pb-16 lg:pt-10">
        {/* Mobile: hero → pulse → map. Desktop: hero + map split, pulse below. */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:gap-10">
          <div className="order-1 flex flex-col gap-6 lg:order-none lg:gap-8">
            <HomeSceneHero />
            <div className="order-3 lg:order-none">
              <HomeScenePulse stats={stats} />
            </div>
          </div>
          <div className="order-4 lg:order-none">
            <HomeMapPreview mapItems={mapItems} mapPins={mapPins} />
          </div>
        </div>

        <section className="mt-8 sm:mt-10 lg:mt-12">
          <HomeSectionHeader title={t.home.nextUp} />
          <HomeFeaturedEvent event={featuredEvent} />
        </section>

        <div className="mt-10 space-y-10 sm:mt-12 sm:space-y-12 lg:space-y-14">
          <HomeExploreEvents events={rawEvents} />
          <HomeFeaturedCommunities clubs={rawClubs} />
          <HomeShopsNearYou shops={rawShops} />
        </div>

        <section className="mt-10 sm:mt-12 lg:mt-14">
          <HomeSceneCTA />
        </section>

        <section className="mt-10 border-t border-white/[0.06] pt-8 sm:mt-12">
          <p className="max-w-3xl text-sm leading-relaxed text-[#64748B]">
            {brand.description}
          </p>
        </section>
      </div>

      <HomeMobileActionBar />
    </div>
  );
}
