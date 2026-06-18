"use client";

import Link from "next/link";

import { useLocale } from "@/components/providers/LocaleProvider";
import { buildStageLabel } from "@/lib/garage/labels";
import { carTitle } from "@/lib/garage/feed-generator";
import type { EnrichedFeedItem } from "@/lib/garage/feed-enrichment";
import type { BuildStage, GarageFeedItemType } from "@/lib/types";

function feedTypeLabel(
  type: GarageFeedItemType,
  t: ReturnType<typeof useLocale>["t"]
): string {
  switch (type) {
    case "mod_added":
      return t.social.modAdded;
    case "mod_installed":
      return t.social.modInstalled;
    case "horsepower_updated":
      return t.social.horsepowerUpdated;
    case "build_stage_updated":
      return t.social.buildStageUpdated;
    case "photo_updated":
      return t.social.photoUpdated;
    case "milestone":
      return t.social.milestone;
    case "progress_update":
      return t.social.progressUpdate;
    case "garage_published":
      return t.social.garagePublished;
    default:
      return type;
  }
}

type GarageFeedItemCardProps = {
  data: EnrichedFeedItem;
};

export function GarageFeedItemCard({ data }: GarageFeedItemCardProps) {
  const { t } = useLocale();
  const { item, garage, car } = data;
  const displayName = garage?.displayName ?? "Garage";
  const vehicle = car ? carTitle(car) : "";
  const image = item.imageUrl ?? car?.primaryImageUrl;

  return (
    <article className="rounded-xl border border-white/[0.08] bg-[#151B24]/50 p-3">
      <div className="flex gap-3">
        <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-[#0B1118]">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="size-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="truncate text-sm font-medium text-[#F8FAFC]">
                {displayName}
              </p>
              {vehicle ? (
                <p className="truncate text-xs text-[#94A3B8]">{vehicle}</p>
              ) : null}
            </div>
            <time className="shrink-0 text-[10px] text-[#64748B]">
              {new Date(item.createdAt).toLocaleDateString()}
            </time>
          </div>
          <span className="mt-1 inline-block rounded-md bg-[#3B82F6]/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[#93C5FD]">
            {feedTypeLabel(item.type, t)}
          </span>
          <p className="mt-2 text-sm text-[#CBD5E1]">{item.title}</p>
          {item.body ? (
            <p className="mt-1 text-xs text-[#94A3B8]">{item.body}</p>
          ) : null}
          {item.horsepowerSnapshot != null ? (
            <p className="mt-1 text-xs text-[#FCA5A5]">
              {item.horsepowerSnapshot} {t.garage.horsepowerUnit}
            </p>
          ) : null}
          {item.buildStageSnapshot ? (
            <p className="mt-1 text-xs text-[#93C5FD]">
              {buildStageLabel(item.buildStageSnapshot as BuildStage, t)}
            </p>
          ) : null}
          <Link
            href={`/garage/${item.garageId}`}
            className="mt-2 inline-block text-xs font-medium text-[#3B82F6] hover:underline"
          >
            {t.social.viewGarage}
          </Link>
        </div>
      </div>
    </article>
  );
}
