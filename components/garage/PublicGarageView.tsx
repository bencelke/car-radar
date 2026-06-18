"use client";

import Link from "next/link";

import { GarageFollowButton } from "@/components/garage/GarageFollowButton";
import { DetailShareBar } from "@/components/share/DetailShareBar";
import { useLocale } from "@/components/providers/LocaleProvider";
import { buildStageLabel } from "@/lib/garage/labels";
import type {
  BuildProgressUpdate,
  GarageCar,
  GarageMod,
  GarageProfile,
} from "@/lib/types";

type PublicGarageViewProps = {
  garage: GarageProfile;
  car: GarageCar;
  mods: GarageMod[];
  updates: BuildProgressUpdate[];
};

export function PublicGarageView({
  garage,
  car,
  mods,
  updates,
}: PublicGarageViewProps) {
  const { t } = useLocale();
  const title = [car.year, car.make, car.model].filter(Boolean).join(" ");

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1118]/80">
        <div className="aspect-[16/10] bg-[#151B24]">
          {car.primaryImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={car.primaryImageUrl}
              alt={title}
              className="size-full object-cover"
            />
          ) : null}
        </div>
        <div className="p-4">
          <h1 className="font-heading text-xl font-bold text-[#F8FAFC]">
            {title}
          </h1>
          <p className="text-sm text-[#94A3B8]">{garage.displayName}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#CBD5E1]">
            {[garage.city, garage.area, garage.country].filter(Boolean).join(" · ")}
            {garage.clubName ? ` · ${garage.clubName}` : ""}
          </div>
          {car.horsepower != null ? (
            <p className="mt-2 text-sm text-[#FCA5A5]">
              {car.horsepower} {t.garage.horsepowerUnit}
            </p>
          ) : null}
          {car.buildStage ? (
            <p className="mt-1 text-xs text-[#93C5FD]">
              {buildStageLabel(car.buildStage, t)}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <GarageFollowButton
              garage={garage}
              returnPath={`/garage/${garage.id}`}
            />
            <DetailShareBar
              entity={{ type: "garage", garage, car }}
              inviteOptions={{ joinShiftIt: true }}
            />
          </div>
        </div>
      </div>

      {car.buildSummary ? (
        <section className="rounded-xl border border-white/[0.08] bg-[#0B1118]/60 p-4">
          <h2 className="text-sm font-semibold text-[#F8FAFC]">
            {t.garage.buildSummary}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">
            {car.buildSummary}
          </p>
        </section>
      ) : null}

      {mods.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-[#F8FAFC]">
            {t.garage.mods}
          </h2>
          <ul className="space-y-2">
            {mods.map((mod) => (
              <li
                key={mod.id}
                className="rounded-xl border border-white/[0.08] bg-[#151B24]/50 p-3"
              >
                <p className="text-[10px] uppercase text-[#64748B]">
                  {mod.category}
                </p>
                <p className="font-medium text-[#F8FAFC]">{mod.name}</p>
                {mod.brand ? (
                  <p className="text-xs text-[#94A3B8]">{mod.brand}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {updates.length > 0 ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-[#F8FAFC]">
            {t.garage.buildProgress}
          </h2>
          <ol className="space-y-2">
            {updates.map((u) => (
              <li
                key={u.id}
                className="rounded-xl border border-white/[0.08] bg-[#151B24]/50 p-3"
              >
                <p className="font-medium text-[#F8FAFC]">{u.title}</p>
                {u.body ? (
                  <p className="mt-1 text-xs text-[#94A3B8]">{u.body}</p>
                ) : null}
                <time className="mt-1 block text-[10px] text-[#64748B]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {garage.memberProfileId ? (
        <Link
          href={`/members/${garage.memberProfileId}`}
          className="text-sm text-[#3B82F6] hover:underline"
        >
          {t.garage.viewMemberProfile}
        </Link>
      ) : null}
    </div>
  );
}
