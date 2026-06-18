"use client";

import { useEffect, useState } from "react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { getFollowerCount } from "@/lib/repositories/garage-follows";
import type { GarageProfile } from "@/lib/types";

type GarageFollowerStatsProps = {
  garage: GarageProfile;
  className?: string;
};

export function GarageFollowerStats({ garage, className }: GarageFollowerStatsProps) {
  const { t } = useLocale();
  const [count, setCount] = useState(garage.followerCount ?? 0);

  useEffect(() => {
    let cancelled = false;
    void getFollowerCount(garage.id).then((value) => {
      if (!cancelled) setCount(value);
    });
    return () => {
      cancelled = true;
    };
  }, [garage.id, garage.followerCount]);

  return (
    <p className={className}>
      <span className="font-semibold text-[#F8FAFC]">{count.toLocaleString()}</span>{" "}
      <span className="text-[#94A3B8]">{t.social.followers}</span>
    </p>
  );
}
