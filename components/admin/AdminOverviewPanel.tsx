"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import { getAdminOverviewStats } from "@/lib/repositories/admin-data";
import type { AdminOverviewStats } from "@/lib/repositories/admin-data";

type AdminOverviewPanelProps = {
  pendingCount: number;
};

export function AdminOverviewPanel({ pendingCount }: AdminOverviewPanelProps) {
  const { t } = useLocale();
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void getAdminOverviewStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: t.admin.overviewClubs, value: stats?.clubCount, accent: "blue" as const },
    { label: t.admin.overviewMembers, value: stats?.memberCount, accent: "purple" as const },
    {
      label: t.admin.overviewEvents,
      value: stats?.upcomingEventCount,
      accent: "red" as const,
    },
    {
      label: t.admin.overviewShops,
      value: stats?.shopCount ?? "—",
      accent: "blue" as const,
    },
    {
      label: t.admin.overviewPending,
      value: pendingCount || stats?.pendingSubmissionCount,
      accent: "amber" as const,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-[#F8FAFC]">
          {t.admin.overviewTitle}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">{t.admin.overviewSubtitle}</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <Loader2 className="size-4 animate-spin" />
          {t.admin.loading}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {cards.map((card) => (
            <AdminStatCard
              key={card.label}
              label={card.label}
              value={card.value}
              accent={card.accent}
            />
          ))}
        </div>
      )}
    </div>
  );
}
